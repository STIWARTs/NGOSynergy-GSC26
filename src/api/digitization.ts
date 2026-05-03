import { fetchApi, fetchApiFormData } from './client'
import { DigitizationItem, DigitizedExtraction } from '@/types'

export const digitizationService = {
  getQueue: async (): Promise<DigitizationItem[]> => {
    const response = await fetchApi<{ items: DigitizationItem[] }>('GET', '/api/digitization/queue')
    return response.items || []
  },

  uploadFiles: async (files: File[], source: 'batch' | 'single'): Promise<DigitizationItem[]> => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('source', source)
    
    // The current backend upload route only processes one file and returns { success, filename, extractedData }
    // We'll wrap it in a pseudo-DigitizationItem array to keep the UI components working
    const response = await fetchApiFormData<any>('/api/digitization/upload', formData)
    
    return [{
      id: `doc-${Date.now()}`,
      filename: response.filename || 'Uploaded Document',
      imageUrl: response.imageUrl || '',
      status: 'pending',
      uploadedAt: new Date(),
      source,
      pageCount: 1,
      progress: 100,
      extractedData: response.extractedData
    }]
  },

  updateProgress: async (_id: string): Promise<DigitizationItem | null> => {
    // TODO: backend does not support this yet; keeping as stub
    return null
  },

  approveAndCommit: async (id: string, extractedData: DigitizedExtraction): Promise<DigitizationItem | null> => {
    return fetchApi<DigitizationItem>('POST', '/api/digitization/commit', { id, ...extractedData })
  },

  flagForRescan: async (_id: string): Promise<DigitizationItem | null> => {
    // TODO: backend does not support this yet; keeping as stub
    return null
  },

  discard: async (_id: string): Promise<DigitizationItem | null> => {
    // TODO: backend does not support this yet; keeping as stub
    return null
  },

  getCommittedCount: async (): Promise<number> => {
    // TODO: backend does not support this yet; keeping as stub
    return 0
  },
}
