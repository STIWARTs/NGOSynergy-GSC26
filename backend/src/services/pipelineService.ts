/**
 * Data Digitization Pipeline Service
 * Architecture: User Input → Document AI (OCR) → Preprocessing → Gemini JSON → Validate → Firestore
 *
 * Priority Formula: PriorityScore = (Category × 0.4) + (Severity × 0.3) + (ScaleFactor × 0.2) + (WaitTime × 0.1)
 */

import { DocumentProcessorServiceClient } from '@google-cloud/documentai'
import axios from 'axios'
import admin from 'firebase-admin'
import { storageService } from './storageService.js'
import { documentService } from './documentService.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CrisisData {
  category: 'Water' | 'Food' | 'Health' | 'Shelter' | 'Rescue'
  severity: number
  urgency: 'LOW' | 'MEDIUM' | 'HIGH'
  people_affected: number
  location_name: string
  summary: string
}

export interface PipelineResult {
  id: string
  data: CrisisData & {
    priorityScore: number
    priorityBreakdown: {
      categoryScore: number
      severityScore: number
      scaleScore: number
      waitTimeScore: number
    }
    scaleFactor: number
    status: string
    originalText: string
    createdAt: FirebaseFirestore.Timestamp | Date
  }
  pipelineMetadata: {
    ocrConfidence: number
    mimeType: string
    textLength: number
    processingTimeMs: number
  }
}

export type PipelineStep = 'ocr' | 'preprocessing' | 'gemini' | 'validation' | 'storage' | 'done' | 'error'

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_WEIGHTS: Record<string, number> = {
  Health: 10,
  Rescue: 8,
  Water: 6,
  Food: 5,
  Shelter: 4,
}

const VALID_CATEGORIES = ['Water', 'Food', 'Health', 'Shelter', 'Rescue']
const VALID_URGENCIES = ['LOW', 'MEDIUM', 'HIGH']

// ─── Gemini Response Schema (2026 Pro Move — Schema-Enforced) ─────────────────

const CRISIS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['Water', 'Food', 'Health', 'Shelter', 'Rescue'],
      description: 'Category of the crisis',
    },
    severity: {
      type: 'number',
      description: 'Severity level 1–10',
    },
    urgency: {
      type: 'string',
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      description: 'Urgency classification',
    },
    people_affected: {
      type: 'number',
      description: 'Number of people affected',
    },
    location_name: {
      type: 'string',
      description: 'Name of the location',
    },
    summary: {
      type: 'string',
      description: 'Brief summary of the crisis situation',
    },
  },
  required: ['category', 'severity', 'urgency', 'location_name', 'summary'],
}

// ─── Step 1: Document AI OCR ───────────────────────────────────────────────────

function detectMimeType(buffer: Buffer, filename = ''): string {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png'
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44) return 'application/pdf'

  if (filename) {
    const ext = filename.toLowerCase().split('.').pop()
    const map: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
      tiff: 'image/tiff',
      tif: 'image/tiff',
    }
    return map[ext ?? ''] || 'application/octet-stream'
  }
  return 'application/octet-stream'
}

async function runOCR(buffer: Buffer, filename: string): Promise<{ text: string; mimeType: string; confidence: number }> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
  const location = process.env.DOCUMENT_AI_LOCATION || 'us'
  const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID

  if (!projectId || !processorId) {
    console.warn('[Pipeline] Document AI not configured — using mock OCR')
    return {
      text: `Crisis Report: Severe flooding in Village Sector 5. Water level rising rapidly. Approximately 250 people affected. Immediate rescue needed. Location: Sector 5, District A. Reporter: Field Agent.`,
      mimeType: 'image/jpeg',
      confidence: 0.85,
    }
  }

  const docAiClient = new DocumentProcessorServiceClient()
  const mimeType = detectMimeType(buffer, filename)
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`

  const [result] = await docAiClient.processDocument({
    name,
    rawDocument: { content: buffer, mimeType },
  } as any)

  const doc = result.document
  const text = doc?.text || ''

  // Calculate average confidence
  let totalConf = 0, count = 0
  for (const page of doc?.pages ?? []) {
    for (const token of page.tokens ?? []) {
      if ((token as any).layout?.confidence) {
        totalConf += (token as any).layout.confidence
        count++
      }
    }
  }
  const confidence = count > 0 ? totalConf / count : 0

  return { text, mimeType, confidence }
}

// ─── Step 2: Preprocessing ─────────────────────────────────────────────────────

function preprocess(rawText: string): string {
  const categoryMap: Record<string, string> = {
    'lack of water': 'Water shortage',
    'no water': 'Water shortage',
    medical: 'Health crisis',
    hospital: 'Health emergency',
    disease: 'Health crisis',
    homeless: 'Shelter crisis',
    trapped: 'Rescue needed',
    emergency: 'Rescue emergency',
  }

  let cleaned = rawText
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Normalize common phrases
  for (const [key, val] of Object.entries(categoryMap)) {
    const regex = new RegExp(key, 'gi')
    cleaned = cleaned.replace(regex, val)
  }

  return cleaned
}

// ─── Step 3: Gemini AI JSON Extraction ────────────────────────────────────────

async function extractWithGemini(cleanText: string): Promise<CrisisData> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.warn('[Pipeline] Gemini API key not configured — using mock extraction')
    return {
      category: 'Water',
      severity: 8,
      urgency: 'HIGH',
      people_affected: 250,
      location_name: 'Sector 5, District A',
      summary: 'Severe water shortage and flooding affecting 250 people requiring immediate rescue.',
    }
  }

  const prompt = `You are an NGO crisis analysis system.

TASK: Convert raw field report into STRICT JSON following the schema provided.

RULES:
- Only return valid JSON matching the schema exactly
- No explanation, no markdown code blocks
- Categories allowed: ["Water", "Food", "Health", "Shelter", "Rescue"]
- Severity: 1-3 = LOW, 4-6 = MEDIUM, 7-10 = HIGH
- urgency must match severity: severity 1-3 → "LOW", 4-6 → "MEDIUM", 7-10 → "HIGH"
- people_affected: estimate if not stated (use 0 if unclear)
- location_name: extract or use "Unknown Location"

TEXT:
${cleanText}`

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: CRISIS_RESPONSE_SCHEMA,
        temperature: 0.1,
      },
    }
  )

  const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  const parsed = JSON.parse(raw)

  return parsed as CrisisData
}

// ─── Step 4: Validation ────────────────────────────────────────────────────────

function validateCrisisData(data: any): CrisisData {
  const errors: string[] = []

  if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')} (got: ${data.category})`)
  }
  if (typeof data.severity !== 'number' || data.severity < 1 || data.severity > 10) {
    errors.push(`severity must be a number 1-10 (got: ${data.severity})`)
  }
  if (!data.urgency || !VALID_URGENCIES.includes(data.urgency)) {
    errors.push(`urgency must be one of: ${VALID_URGENCIES.join(', ')} (got: ${data.urgency})`)
  }
  if (!data.location_name || typeof data.location_name !== 'string') {
    errors.push('location_name is required')
  }
  if (!data.summary || data.summary.length < 10) {
    errors.push('summary must be at least 10 characters')
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(' | ')}`)
  }

  return {
    category: data.category,
    severity: data.severity,
    urgency: data.urgency,
    people_affected: typeof data.people_affected === 'number' ? data.people_affected : 0,
    location_name: data.location_name,
    summary: data.summary,
  }
}

// ─── Priority Score Calculation ────────────────────────────────────────────────

function calculatePriorityScore(validData: CrisisData): {
  priorityScore: number
  priorityBreakdown: { categoryScore: number; severityScore: number; scaleScore: number; waitTimeScore: number }
  scaleFactor: number
} {
  const categoryWeight = CATEGORY_WEIGHTS[validData.category] || 5
  const severity = validData.severity

  // Scale factor: logarithmic scaling of people affected (0-10)
  const peopleAffected = validData.people_affected || 0
  const scaleFactor = peopleAffected > 0
    ? Math.min(Math.log10(peopleAffected + 1) * 2.5, 10)
    : 0

  // New reports start at 0 (grows over time via re-calculation)
  const waitTimeFactor = 0

  const categoryScore = categoryWeight * 0.4
  const severityScore = severity * 0.3
  const scaleScore = scaleFactor * 0.2
  const waitTimeScore = waitTimeFactor * 0.1

  const priorityScore = categoryScore + severityScore + scaleScore + waitTimeScore

  return {
    priorityScore: Math.round(priorityScore * 100) / 100,
    priorityBreakdown: {
      categoryScore: Math.round(categoryScore * 100) / 100,
      severityScore: Math.round(severityScore * 100) / 100,
      scaleScore: Math.round(scaleScore * 100) / 100,
      waitTimeScore: Math.round(waitTimeScore * 100) / 100,
    },
    scaleFactor: Math.round(scaleFactor * 100) / 100,
  }
}

// ─── Step 5: Save to Firestore ────────────────────────────────────────────────

async function saveToFirestore(
  finalData: any,
  originalText: string
): Promise<string> {
  if (admin.apps.length === 0) {
    console.warn('[Pipeline] Firebase not initialized — returning mock ID')
    return `mock-${Date.now()}`
  }

  const db = admin.firestore()
  const docRef = await db.collection('crises').add({
    ...finalData,
    originalText,
    status: 'pending',
    createdAt: admin.firestore.Timestamp.now(),
  })
  return docRef.id
}

// ─── Main Pipeline Orchestrator ────────────────────────────────────────────────

export const pipelineService = {
  /**
   * Process a document buffer through the full Data Digitization Pipeline:
   * User Input → OCR → Preprocessing → Gemini JSON → Validation → Priority Score → Firestore
   */
  async processDocument(
    buffer: Buffer,
    filename: string,
    onStep?: (step: PipelineStep, detail?: string) => void
  ): Promise<PipelineResult> {
    const startTime = Date.now()
    onStep?.('ocr', 'Extracting text with Document AI...')

    // Step 1: OCR
    const { text, mimeType, confidence } = await runOCR(buffer, filename)
    console.log(`[Pipeline] OCR done — ${text.length} chars, confidence: ${(confidence * 100).toFixed(1)}%`)

    // Step 2: Preprocessing
    onStep?.('preprocessing', 'Cleaning and normalizing text...')
    const cleanText = preprocess(text)
    console.log('[Pipeline] Preprocessing done')

    // Step 3: Gemini AI JSON Extraction
    onStep?.('gemini', 'Extracting structured data with Gemini AI...')
    const structured = await extractWithGemini(cleanText)
    console.log('[Pipeline] Gemini extraction done:', structured.category, `severity ${structured.severity}`)

    // Step 4: Validation (Zod-style manual validation)
    onStep?.('validation', 'Validating and scoring crisis data...')
    const validData = validateCrisisData(structured)

    // Priority Score Calculation
    const { priorityScore, priorityBreakdown, scaleFactor } = calculatePriorityScore(validData)
    console.log(`[Pipeline] Priority score: ${priorityScore}`)

    const finalData = {
      ...validData,
      priorityScore,
      priorityBreakdown,
      scaleFactor,
    }

    // Step 5: Save crisis to Firestore
    onStep?.('storage', 'Saving to Firestore database...')
    const id = await saveToFirestore(finalData, text)
    console.log(`[Pipeline] Saved to Firestore — ID: ${id}`)

    // Step 6: Upload PDF to Firebase Storage and save document record
    let storageUrl = ''
    let storagePath = ''
    let documentId = ''
    try {
      const storageResult = await storageService.uploadFile(buffer, filename, mimeType, 'digitized-pdfs')
      storageUrl = storageResult.storageUrl
      storagePath = storageResult.storagePath
      console.log(`[Pipeline] PDF uploaded to Storage — path: ${storagePath}`)

      documentId = await documentService.saveDocument({
        filename,
        storagePath,
        storageUrl,
        mimeType,
        uploadedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        crisisId: id,
        category: finalData.category,
        severity: finalData.severity,
        urgency: finalData.urgency,
        people_affected: finalData.people_affected,
        location_name: finalData.location_name,
        summary: finalData.summary,
        priorityScore: finalData.priorityScore,
        ocrText: text,
        ocrConfidence: confidence,
        processingTimeMs: Date.now() - startTime,
        status: 'processed',
      })
      console.log(`[Pipeline] Document record saved — ID: ${documentId}`)
    } catch (storageErr: any) {
      console.warn('[Pipeline] Storage/document save failed (non-fatal):', storageErr.message)
    }

    onStep?.('done', `Pipeline complete. Crisis ID: ${id}`)

    return {
      id,
      data: {
        ...finalData,
        originalText: text,
        status: 'pending',
        createdAt: new Date(),
        documentId,
        storageUrl,
      },
      pipelineMetadata: {
        ocrConfidence: confidence,
        mimeType,
        textLength: text.length,
        processingTimeMs: Date.now() - startTime,
      },
    }
  },

  /**
   * Process raw text directly (skip OCR — for manual text input)
   */
  async processText(rawText: string): Promise<PipelineResult> {
    const startTime = Date.now()

    const cleanText = preprocess(rawText)
    const structured = await extractWithGemini(cleanText)
    const validData = validateCrisisData(structured)
    const { priorityScore, priorityBreakdown, scaleFactor } = calculatePriorityScore(validData)

    const finalData = { ...validData, priorityScore, priorityBreakdown, scaleFactor }
    const id = await saveToFirestore(finalData, rawText)

    return {
      id,
      data: {
        ...finalData,
        originalText: rawText,
        status: 'pending',
        createdAt: new Date(),
      },
      pipelineMetadata: {
        ocrConfidence: 1.0,
        mimeType: 'text/plain',
        textLength: rawText.length,
        processingTimeMs: Date.now() - startTime,
      },
    }
  },

  /**
   * Get all crises from Firestore, sorted by priority score (descending)
   */
  async getAllCrises(limit = 50): Promise<any[]> {
    if (admin.apps.length === 0) {
      return getMockCrises()
    }

    const db = admin.firestore()
    const snapshot = await db
      .collection('crises')
      .orderBy('priorityScore', 'desc')
      .limit(limit)
      .get()

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  },

  /**
   * Get crises filtered by category
   */
  async getCrisesByCategory(category: string): Promise<any[]> {
    if (admin.apps.length === 0) {
      return getMockCrises().filter((c) => c.category === category)
    }

    const db = admin.firestore()
    const snapshot = await db
      .collection('crises')
      .where('category', '==', category)
      .orderBy('priorityScore', 'desc')
      .get()

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  },

  /**
   * Update crisis status
   */
  async updateCrisisStatus(id: string, status: string): Promise<void> {
    if (admin.apps.length === 0) return
    const db = admin.firestore()
    await db.collection('crises').doc(id).update({ status, updatedAt: admin.firestore.Timestamp.now() })
  },
}

// ─── Mock Data (fallback when Firebase is unavailable) ─────────────────────────

function getMockCrises() {
  return [
    {
      id: 'mock-1',
      category: 'Health',
      severity: 9,
      urgency: 'HIGH',
      people_affected: 450,
      location_name: 'Village A, Sector 3',
      summary: 'Cholera outbreak spreading rapidly. 450 people at risk. Medical teams needed immediately.',
      priorityScore: 9.8,
      priorityBreakdown: { categoryScore: 4.0, severityScore: 2.7, scaleScore: 1.32, waitTimeScore: 0 },
      scaleFactor: 6.6,
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'mock-2',
      category: 'Rescue',
      severity: 8,
      urgency: 'HIGH',
      people_affected: 120,
      location_name: 'Flood Zone B, District 2',
      summary: 'People trapped on rooftops due to flash flood. Rescue boats required urgently.',
      priorityScore: 8.9,
      priorityBreakdown: { categoryScore: 3.2, severityScore: 2.4, scaleScore: 1.26, waitTimeScore: 0 },
      scaleFactor: 6.3,
      status: 'pending',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: 'mock-3',
      category: 'Water',
      severity: 7,
      urgency: 'HIGH',
      people_affected: 800,
      location_name: 'Central District, Area 5',
      summary: 'Severe water shortage. Contamination of main supply. 800 residents without safe water.',
      priorityScore: 7.6,
      priorityBreakdown: { categoryScore: 2.4, severityScore: 2.1, scaleScore: 1.49, waitTimeScore: 0 },
      scaleFactor: 7.45,
      status: 'active',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: 'mock-4',
      category: 'Food',
      severity: 6,
      urgency: 'MEDIUM',
      people_affected: 300,
      location_name: 'Rural Block 7, East Zone',
      summary: 'Food shortage affecting 300 displaced families after flooding. Emergency ration distribution needed.',
      priorityScore: 5.8,
      priorityBreakdown: { categoryScore: 2.0, severityScore: 1.8, scaleScore: 1.36, waitTimeScore: 0 },
      scaleFactor: 6.8,
      status: 'pending',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    {
      id: 'mock-5',
      category: 'Shelter',
      severity: 5,
      urgency: 'MEDIUM',
      people_affected: 200,
      location_name: 'Riverside Colony',
      summary: 'Families displaced from homes. Temporary shelter and basic amenities required.',
      priorityScore: 4.7,
      priorityBreakdown: { categoryScore: 1.6, severityScore: 1.5, scaleScore: 1.16, waitTimeScore: 0 },
      scaleFactor: 5.8,
      status: 'pending',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ]
}
