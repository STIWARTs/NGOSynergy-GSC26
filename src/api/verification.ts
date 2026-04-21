import { VerificationItem } from '@/types'
import { fetchApi } from './client'

export const verificationService = {
  async getAll(): Promise<VerificationItem[]> {
    return fetchApi<VerificationItem[]>('GET', '/api/verification')
  },
  async verify(id: string): Promise<void> {
    return fetchApi<void>('POST', `/api/verification/approve/${id}`)
  },
  async reject(id: string, reason: string): Promise<void> {
    return fetchApi<void>('POST', `/api/verification/reject/${id}`, { reason })
  },
  async forwardToGovernment(id: string): Promise<void> {
    // TODO: replace with dedicated endpoint when backend supports it
    return fetchApi<void>('POST', `/api/verification/approve/${id}`)
  },
}
