import { Incident } from '@/types'
import { mockIncidents } from '@/lib/mockData'

export const incidentService = {
  getAll: async (): Promise<Incident[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockIncidents)
      }, 300)
    })
  },

  getActive: async (): Promise<Incident[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockIncidents.filter((i) => i.status === 'active'))
      }, 300)
    })
  },

  getHighUrgency: async (): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const count = mockIncidents.filter((i) => i.urgencyScore >= 70).length
        resolve(count)
      }, 300)
    })
  },

  getStats: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          activeFieldworkers: 12,
          pendingDigitization: 5,
          highUrgencyTasks: mockIncidents.filter((i) => i.urgencyScore >= 70).length,
          avgResponseTime: 24,
        })
      }, 300)
    })
  },
}
