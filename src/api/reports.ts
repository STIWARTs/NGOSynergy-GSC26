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

interface ReportSubmissionWithFilePayload {
  category: string
  severity: number
  coordinates: { lat: number; lng: number }
  file?: File
  photoUrl?: string
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

  submitWithFile: async (payload: ReportSubmissionWithFilePayload): Promise<ReportSubmissionResponse> => {
    const formData = new FormData()
    formData.append('category', payload.category)
    formData.append('severity', String(payload.severity))
    formData.append('coordinates', JSON.stringify(payload.coordinates))
    
    if (payload.file) {
      formData.append('file', payload.file)
    }
    
    if (payload.photoUrl) {
      formData.append('photoUrl', payload.photoUrl)
    }
    
    if (payload.reporterName) {
      formData.append('reporterName', payload.reporterName)
    }
    
    if (payload.description) {
      formData.append('description', payload.description)
    }
    
    if (payload.affectedCount !== undefined) {
      formData.append('affectedCount', String(payload.affectedCount))
    }

    const token = localStorage.getItem('authToken')
    const headers: HeadersInit = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const response = await fetch(`${apiBase}/api/reports/submit`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err || 'Report submission failed')
    }

    return response.json()
  },

  getPublic: async (): Promise<Incident[]> => {
    return fetchApi<Incident[]>('GET', '/api/reports/public')
  },
}
