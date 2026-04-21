import { Volunteer } from '@/types'
import { mockVolunteers } from '@/lib/mockData'

export const volunteerService = {
  getAll: async (search?: string, filters?: any): Promise<Volunteer[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...mockVolunteers]

        if (search) {
          const term = search.toLowerCase()
          results = results.filter(
            (v) =>
              v.name.toLowerCase().includes(term) ||
              v.skills.some((s) => s.toLowerCase().includes(term)) ||
              v.certifications.some((c) => c.toLowerCase().includes(term))
          )
        }

        if (filters?.status) {
          results = results.filter((v) => v.status === filters.status)
        }

        if (filters?.minReliability) {
          results = results.filter((v) => v.reliability >= filters.minReliability)
        }

        resolve(results)
      }, 300)
    })
  },

  getById: async (id: string): Promise<Volunteer | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const volunteer = mockVolunteers.find((v) => v.id === id)
        resolve(volunteer || null)
      }, 200)
    })
  },
}
