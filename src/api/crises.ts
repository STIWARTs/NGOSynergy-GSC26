/**
 * Crises API service — interfaces with /api/crises (Data Digitization Pipeline output)
 * Returns prioritized crisis data sorted by AI-computed priorityScore
 */

import { fetchApi } from './client'

export interface CrisisItem {
  id: string
  category: 'Water' | 'Food' | 'Health' | 'Shelter' | 'Rescue'
  severity: number
  urgency: 'LOW' | 'MEDIUM' | 'HIGH'
  people_affected: number
  location_name: string
  summary: string
  priorityScore: number
  priorityBreakdown: {
    categoryScore: number
    severityScore: number
    scaleScore: number
    waitTimeScore: number
  }
  scaleFactor: number
  status: 'pending' | 'active' | 'resolved' | 'dismissed'
  createdAt: string | { seconds: number }
  originalText?: string
}

export interface CrisesResponse {
  crises: CrisisItem[]
  total: number
  timestamp: string
  sortedBy: string
}

export const crisesService = {
  /**
   * Get all crises sorted by priorityScore (highest first)
   * This is the key endpoint for the Dashboard "Prioritized Issues" panel
   */
  getAll: async (limit = 50): Promise<CrisesResponse> => {
    return fetchApi<CrisesResponse>('GET', `/api/crises?limit=${limit}`)
  },

  /**
   * Get crises filtered by category
   */
  getByCategory: async (category: string): Promise<CrisesResponse> => {
    return fetchApi<CrisesResponse>('GET', `/api/crises?category=${category}`)
  },

  /**
   * Update crisis status
   */
  updateStatus: async (id: string, status: string): Promise<void> => {
    await fetchApi('PATCH', `/api/crises/${id}/status`, { status })
  },

  /**
   * Process a document through the full pipeline:
   * OCR → Preprocess → Gemini JSON → Validate → Priority Score → Firestore
   */
  processPipelineFile: async (
    file: File,
    onProgress?: (step: string) => void
  ): Promise<{ id: string; crisis: CrisisItem; pipelineMetadata: any }> => {
    const formData = new FormData()
    formData.append('file', file)

    onProgress?.('Uploading document...')

    const token = localStorage.getItem('authToken')
    const headers: HeadersInit = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const response = await fetch(`${apiBase}/api/digitization/process`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err || 'Pipeline processing failed')
    }

    return response.json()
  },

  /**
   * Process raw text through the pipeline (skip OCR)
   */
  processPipelineText: async (
    text: string
  ): Promise<{ id: string; crisis: CrisisItem; pipelineMetadata: any }> => {
    return fetchApi('POST', '/api/digitization/process', { text })
  },
}
