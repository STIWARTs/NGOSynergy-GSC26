import { fetchApi } from './client'

export interface DigiDocument {
  id: string
  filename: string
  storagePath: string
  storageUrl: string
  mimeType: string
  uploadedAt: string
  processedAt: string
  crisisId: string
  category: string
  severity: number
  urgency: 'LOW' | 'MEDIUM' | 'HIGH'
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

export const documentsApi = {
  listDocuments: async (): Promise<DigiDocument[]> => {
    const res = await fetchApi<{ documents: DigiDocument[] }>('GET', '/api/documents')
    return res.documents || []
  },

  getDocument: async (id: string): Promise<DigiDocument> => {
    const res = await fetchApi<{ document: DigiDocument }>('GET', `/api/documents/${id}`)
    return res.document
  },

  getSignedUrl: async (id: string): Promise<string> => {
    const res = await fetchApi<{ signedUrl: string }>('GET', `/api/documents/${id}/signed-url`)
    return res.signedUrl
  },

  getChatHistory: async (id: string): Promise<ChatMessage[]> => {
    const res = await fetchApi<{ history: ChatMessage[] }>('GET', `/api/documents/${id}/chat`)
    return res.history || []
  },

  sendMessage: async (
    id: string,
    message: string
  ): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> => {
    return fetchApi('POST', `/api/documents/${id}/chat`, { message })
  },

  getSummary: async (id: string): Promise<string> => {
    const res = await fetchApi<{ summary: string }>('POST', `/api/documents/${id}/summarize`, {})
    return res.summary || ''
  },
}
