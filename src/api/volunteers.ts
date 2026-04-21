import { Volunteer } from '@/types'
import { fetchApi } from './client'

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
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.minReliability) params.append('minReliability', String(filters.minReliability))
    if (filters?.skill) params.append('skill', filters.skill)
    params.append('page', String(page))
    params.append('pageSize', String(pageSize))

    const query = params.toString()
    return fetchApi<VolunteerListResponse>('GET', `/api/volunteers${query ? `?${query}` : ''}`)
  },

  getById: async (id: string): Promise<Volunteer | null> => {
    return fetchApi<Volunteer>('GET', `/api/volunteers/${id}`)
  },
}
