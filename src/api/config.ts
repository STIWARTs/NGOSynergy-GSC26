import { AIWeights, UrgencyMultipliers } from '@/types'
import { fetchApi } from './client'

export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const configService = {
  async getWeights(): Promise<AIWeights> {
    return fetchApi<AIWeights>('GET', '/api/admin/weights')
  },
  async patchWeights(weights: AIWeights): Promise<void> {
    return fetchApi<void>('PATCH', '/api/admin/weights', { weights })
  },
  async getStats(): Promise<any> {
    return fetchApi<any>('GET', '/api/admin/stats')
  },
  async patchMultipliers(_multipliers: UrgencyMultipliers): Promise<void> {
    // TODO: backend endpoint not yet available
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
}
