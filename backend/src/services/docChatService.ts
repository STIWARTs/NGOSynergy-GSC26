/**
 * Document Chat Service — Gemini-powered chat about a specific digitized document
 * Uses the document's OCR text + metadata as context
 */

import axios from 'axios'
import { DigiDocument, ChatMessage } from './documentService.js'

const GEMINI_MODEL = 'gemini-2.0-flash'

/**
 * Build the system context for a document
 */
function buildDocumentContext(doc: DigiDocument): string {
  return `You are an expert NGO crisis analyst assistant. You have access to a digitized field report document that has been processed through our AI pipeline.

DOCUMENT METADATA:
- Filename: ${doc.filename}
- Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}
- Category: ${doc.category}
- Severity: ${doc.severity}/10
- Urgency: ${doc.urgency}
- People Affected: ${doc.people_affected.toLocaleString()}
- Location: ${doc.location_name}
- Priority Score: ${doc.priorityScore}/10
- Pipeline AI Summary: ${doc.summary}

FULL OCR TEXT FROM DOCUMENT:
${doc.ocrText}

Your role:
- Answers must agree with BOTH the filename/context and OCR text below. If OCR clearly describes something different from extraction metadata (wrong category vs text), prioritize OCR and say extraction may be stale.
- Answer questions about this specific document and crisis situation
- Provide actionable recommendations for NGO response
- Summarize key facts clearly and concisely
- If asked for a summary, provide: situation overview, people affected, urgency, and recommended immediate actions
- Always reference specific details from the document when possible
- Be direct and professional — this is a crisis response context`
}

/**
 * Send a chat message to Gemini with full document context and history.
 * Returns the assistant's reply.
 */
export async function chatWithDocument(
  doc: DigiDocument,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.warn('[DocChat] Gemini API key not configured — returning mock response')
    return generateMockResponse(doc, userMessage)
  }

  // Build the conversation history for Gemini
  const systemContext = buildDocumentContext(doc)

  // Convert chat history to Gemini format (user/model alternating)
  const geminiHistory = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }))

  // Prepend system context as the first "user" turn with a model acknowledgement
  // Gemini 1.5 Flash supports system instructions via a separate field
  const requestBody = {
    system_instruction: {
      parts: [{ text: systemContext }],
    },
    contents: [
      ...geminiHistory,
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      requestBody
    )

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I could not generate a response. Please try again.'

    return reply.trim()
  } catch (error: any) {
    const status = error?.response?.status
    const details = error?.response?.data
    const message = details?.error?.message || error?.message || 'Unknown Gemini error'

    console.error('[DocChat] Gemini API error:', {
      status,
      message,
      details,
    })

    console.warn('[DocChat] Falling back to local mock response')
    return generateMockResponse(doc, userMessage)
  }
}

/**
 * Generate an auto-summary for when the document viewer opens
 */
export async function generateDocumentSummary(doc: DigiDocument): Promise<string> {
  return chatWithDocument(doc, [], 
    `Please provide a comprehensive summary of this document including: 
    1. The crisis situation overview
    2. Key statistics (people affected, severity, location)
    3. Urgency assessment  
    4. Recommended immediate actions for the NGO response team
    Keep it structured and actionable.`)
}

// ─── Mock fallback ─────────────────────────────────────────────────────────────

function mockPreamble(doc: DigiDocument): string {
  return (
    `[Offline mode — Gemini rejected or GEMINI_API_KEY missing. Showing text from Firestore only (category/summary/OCR captured at pipeline time); this may not match the PDF if the pipeline used demo OCR or the file was swapped after upload.] ` +
    `Filename: "${doc.filename}". OCR excerpt starts: "${(doc.ocrText || '').slice(0, 180).replace(/\s+/g, ' ')}…"\n`
  )
}

function generateMockResponse(doc: DigiDocument, question: string): string {
  const lower = question.toLowerCase()
  const intro = mockPreamble(doc)

  if (lower.includes('summar') || lower.includes('overview') || lower.includes('what')) {
    return (
      `${intro}Based on **stored extraction fields**, the record is categorized as ${doc.category} (${doc.urgency} urgency) in ${doc.location_name}. ` +
      `If what you **see** in the viewer conflicts with this, rerun the digitization pipeline on this file so OCR and metadata stay in sync, and set a valid GEMINI_API_KEY for live chat.`
    )
  }
  if (lower.includes('how many') || lower.includes('people') || lower.includes('affected')) {
    return `${intro}Stored field “people affected” = ${doc.people_affected.toLocaleString()} (from pipeline extraction, not recomputed from the PDF bytes).`
  }
  if (lower.includes('location') || lower.includes('where')) {
    return `${intro}Stored location field = "${doc.location_name}".`
  }
  if (lower.includes('action') || lower.includes('recommend') || lower.includes('do')) {
    return `${intro}Suggested actions rely on extraction fields (${doc.category}, severity ${doc.severity}/10); verify they match your actual document before deploying resources.`
  }
  return (
    `${intro}I only have structured fields + OCR text from the backend. Greets like "${question.slice(0, 80)}" don’t change that data. Ask about the OCR text/summary/filename or fix credentials + rerun processing.`
  )
}
