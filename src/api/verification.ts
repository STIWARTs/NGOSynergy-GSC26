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
  async reject(id: string): Promise<void> {
    await wait(150)
    queue = queue.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item))
  },
}
