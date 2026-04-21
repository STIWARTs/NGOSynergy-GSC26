import { VerificationItem } from '@/types'
import { mockVerificationItems } from '@/lib/mockData'

let queue: VerificationItem[] = [...mockVerificationItems]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const verificationService = {
  async getAll(): Promise<VerificationItem[]> {
    await wait(180)
    return [...queue]
  },
  async verify(id: string): Promise<void> {
    await wait(150)
    queue = queue.map((item) => (item.id === id ? { ...item, status: 'verified' } : item))
  },
  async reject(id: string, reason: string): Promise<void> {
    await wait(150)
    queue = queue.map((item) =>
      item.id === id ? { ...item, status: 'rejected', aiAnalysis: `${item.aiAnalysis} Rejection reason: ${reason}.` } : item
    )
  },
  async forwardToGovernment(id: string): Promise<void> {
    await wait(180)
    queue = queue.map((item) =>
      item.id === id
        ? { ...item, aiAnalysis: `${item.aiAnalysis} Summary forwarded to government coordination channel.` }
        : item
    )
  },
}
