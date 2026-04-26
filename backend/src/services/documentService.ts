/**
 * Document Service — Manages digitized document records in Firestore
 * Collection: digitized_documents
 * Sub-collection: digitized_documents/{docId}/chat_history
 */

import admin from 'firebase-admin'

export interface DigiDocument {
  id: string
  filename: string
  storagePath: string
  storageUrl: string
  mimeType: string
  uploadedAt: string
  processedAt: string
  // Pipeline results
  crisisId: string
  category: string
  severity: number
  urgency: string
  people_affected: number
  location_name: string
  summary: string
  priorityScore: number
  ocrText: string
  ocrConfidence: number
  processingTimeMs: number
  status: 'processed' | 'failed'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const COLLECTION = 'digitized_documents'

export const documentService = {
  /**
   * Save a digitized document record after full pipeline processing.
   */
  async saveDocument(doc: Omit<DigiDocument, 'id'>): Promise<string> {
    if (admin.apps.length === 0) {
      console.warn('[DocumentService] Firebase not initialized — mock save')
      return `mock-doc-${Date.now()}`
    }
    const db = admin.firestore()
    const ref = await db.collection(COLLECTION).add({
      ...doc,
      uploadedAt: admin.firestore.Timestamp.now(),
    })
    return ref.id
  },

  /**
   * Get all documents, sorted by uploadedAt descending.
   */
  async getAllDocuments(): Promise<DigiDocument[]> {
    if (admin.apps.length === 0) {
      return getMockDocuments()
    }
    const db = admin.firestore()
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy('uploadedAt', 'desc')
      .limit(100)
      .get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DigiDocument))
  },

  /**
   * Get a single document by ID.
   */
  async getDocument(docId: string): Promise<DigiDocument | null> {
    if (admin.apps.length === 0) {
      return getMockDocuments().find((d) => d.id === docId) || null
    }
    const db = admin.firestore()
    const doc = await db.collection(COLLECTION).doc(docId).get()
    if (!doc.exists) return null
    return { id: doc.id, ...doc.data() } as DigiDocument
  },

  /**
   * Get chat history for a document.
   */
  async getChatHistory(docId: string): Promise<ChatMessage[]> {
    if (admin.apps.length === 0) {
      return []
    }
    const db = admin.firestore()
    const snapshot = await db
      .collection(COLLECTION)
      .doc(docId)
      .collection('chat_history')
      .orderBy('timestamp', 'asc')
      .get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ChatMessage))
  },

  /**
   * Add a message to a document's chat history.
   */
  async addChatMessage(
    docId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<ChatMessage> {
    const message: Omit<ChatMessage, 'id'> = {
      role,
      content,
      timestamp: new Date().toISOString(),
    }

    if (admin.apps.length === 0) {
      return { id: `mock-msg-${Date.now()}`, ...message }
    }

    const db = admin.firestore()
    const ref = await db
      .collection(COLLECTION)
      .doc(docId)
      .collection('chat_history')
      .add(message)

    return { id: ref.id, ...message }
  },
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function getMockDocuments(): DigiDocument[] {
  return [
    {
      id: 'mock-doc-1',
      filename: 'flood_report_sector5.pdf',
      storagePath: 'digitized-pdfs/mock-doc-1.pdf',
      storageUrl: '',
      mimeType: 'application/pdf',
      uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000).toISOString(),
      crisisId: 'mock-1',
      category: 'Rescue',
      severity: 8,
      urgency: 'HIGH',
      people_affected: 250,
      location_name: 'Sector 5, District A',
      summary: 'Severe flooding in Village Sector 5. Water levels rising rapidly. 250 people require immediate rescue.',
      priorityScore: 8.9,
      ocrText: 'Crisis Report: Severe flooding in Village Sector 5...',
      ocrConfidence: 0.95,
      processingTimeMs: 4230,
      status: 'processed',
    },
    {
      id: 'mock-doc-2',
      filename: 'health_emergency_village_a.pdf',
      storagePath: 'digitized-pdfs/mock-doc-2.pdf',
      storageUrl: '',
      mimeType: 'application/pdf',
      uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 6000).toISOString(),
      crisisId: 'mock-2',
      category: 'Health',
      severity: 9,
      urgency: 'HIGH',
      people_affected: 450,
      location_name: 'Village A, Sector 3',
      summary: 'Cholera outbreak spreading rapidly. 450 people at risk. Medical teams needed immediately.',
      priorityScore: 9.8,
      ocrText: 'Health Emergency Report: Cholera outbreak confirmed in Village A...',
      ocrConfidence: 0.92,
      processingTimeMs: 3810,
      status: 'processed',
    },
  ]
}
