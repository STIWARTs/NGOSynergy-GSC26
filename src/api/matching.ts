import { fetchApi } from './client'
import { AIWeights, MatchResult } from '@/types'

interface MatchRequestPayload {
  incidentId: string
  weights: AIWeights
  radiusKm?: number
  limit?: number
}

interface DeployPayload {
  incidentId: string
  volunteerId: string
}

export const matchingService = {
  async getResults(payload: MatchRequestPayload): Promise<MatchResult[]> {
    const response = await fetchApi<{
      incidentId: string
      matches: MatchResult[]
      totalProcessed: number
      timestamp: string
    }>('POST', '/api/match/calculate', {
      incidentId: payload.incidentId,
      radiusKm: payload.radiusKm,
      limit: payload.limit,
    })
    return response.matches
  },

  async deployVolunteer(payload: DeployPayload): Promise<void> {
    return fetchApi<void>('POST', '/api/match/deploy', payload)
  },
}
