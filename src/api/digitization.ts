import { fetchApi, fetchApiFormData } from './client'
import { DigitizationItem, DigitizedExtraction } from '@/types'

export const digitizationService = {
  getQueue: async (): Promise<DigitizationItem[]> => {
    return fetchApi<DigitizationItem[]>('GET', '/api/digitization/queue')
  },

  uploadFiles: async (files: File[], source: 'batch' | 'single'): Promise<DigitizationItem[]> => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('source', source)
    return fetchApiFormData<DigitizationItem[]>('/api/digitization/upload', formData)
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
