import { fetchApi } from './client'
import { AIWeights, MatchResult } from '@/types'

interface MatchRequestPayload {
  incidentId: string
  weights: AIWeights
}

interface DeployPayload {
  incidentId: string
  volunteerId: string
}

export const matchingService = {
  async getResults(payload: MatchRequestPayload): Promise<MatchResult[]> {
    return fetchApi<MatchResult[]>('POST', '/api/match/calculate', payload)
  },

  async deployVolunteer(payload: DeployPayload): Promise<void> {
    return fetchApi<void>('POST', '/api/match/deploy', payload)
  },
}
