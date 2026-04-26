import { Incident } from '@/types'
import { fetchApi } from './client'

interface IncidentStats {
  activeFieldworkers: number
  pendingIncidents: number
  highUrgencyTasks: number
  avgResponseTime: number
}

export const incidentService = {
  getAll: async (): Promise<Incident[]> => {
    return fetchApi<Incident[]>('GET', '/api/incidents')
  },

  getActive: async (): Promise<Incident[]> => {
    const incidents = await fetchApi<Incident[]>('GET', '/api/incidents')
    return incidents.filter((i) => i.status !== 'resolved')
  },

  getHighUrgency: async (): Promise<number> => {
    return fetchApi<number>('GET', '/api/incidents/high-urgency')
  },

  getStats: async (): Promise<IncidentStats> => {
    return fetchApi<IncidentStats>('GET', '/api/incidents/stats/dashboard')
  },
}
