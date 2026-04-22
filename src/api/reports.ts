import { fetchApi } from './client'
import { Incident } from '@/types'

interface ReportSubmissionPayload {
  category: string
  severity: number
  coordinates: { lat: number; lng: number }
  photoUrl: string
  reporterName?: string
  description?: string
  affectedCount?: number
}

interface ReportSubmissionResponse {
  success: boolean
  incidentId: string
  message: string
  verification: {
    photoVerified: boolean
    confidence: number
  }
}

export const reportsService = {
  submit: async (payload: ReportSubmissionPayload): Promise<ReportSubmissionResponse> => {
    return fetchApi<ReportSubmissionResponse>('POST', '/api/reports/submit', payload)
  },
  getPublic: async (): Promise<Incident[]> => {
    return fetchApi<Incident[]>('GET', '/api/reports/public')
  },
}
