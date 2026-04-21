import { Volunteer } from '@/types'
import { mockVolunteers } from '@/lib/mockData'

interface VolunteerQueryFilters {
  status?: string
  minReliability?: number
  skill?: string
}

interface VolunteerListResponse {
  items: Volunteer[]
  total: number
  page: number
  pageSize: number
}

export const volunteerService = {
  getAll: async (
    search?: string,
    filters?: VolunteerQueryFilters,
    page = 1,
    pageSize = 10
  ): Promise<VolunteerListResponse> => {
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
          results = results.filter((v) => v.reliability >= (filters.minReliability ?? 0))
        }

        if (filters?.skill) {
          const skillTerm = filters.skill.toLowerCase()
          results = results.filter((v) => v.skills.some((skill) => skill.toLowerCase().includes(skillTerm)))
        }

        const total = results.length
        const start = (page - 1) * pageSize
        const items = results.slice(start, start + pageSize)

        resolve({ items, total, page, pageSize })
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
