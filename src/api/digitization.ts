import { mockDigitizationItems } from '@/lib/mockData'
import { DigitizationItem, DigitizedExtraction } from '@/types'

let digitizationQueue: DigitizationItem[] = [...mockDigitizationItems]
const committedDocuments: Array<{ id: string; committedAt: Date; payload: DigitizedExtraction }> = []

const createMockExtraction = (filename: string): DigitizedExtraction => ({
  incidentType: 'Flood',
  location: 'Temporary Shelter Sector 3',
  date: new Date().toISOString().slice(0, 10),
  severity: 'Medium',
  reporterName: 'Field Volunteer',
  description: `Auto-extracted summary from ${filename}`,
  affectedCount: String(Math.floor(Math.random() * 180) + 20),
})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const digitizationService = {
  getQueue: async (): Promise<DigitizationItem[]> => {
    await wait(180)
    return [...digitizationQueue].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
  },

  uploadFiles: async (files: File[], source: 'batch' | 'single'): Promise<DigitizationItem[]> => {
    await wait(250)

    const uploadedItems = files.map((file, idx) => ({
      id: `upload-${Date.now()}-${idx}`,
      filename: file.name,
      pageCount: source === 'single' ? 1 : Math.max(1, Math.floor(Math.random() * 4) + 1),
      status: 'uploading' as const,
      uploadedAt: new Date(),
      imageUrl: URL.createObjectURL(file),
      progress: 25,
      source,
      extractedData: null,
    }))

    digitizationQueue = [...uploadedItems, ...digitizationQueue]
    return uploadedItems
  },

  updateProgress: async (id: string): Promise<DigitizationItem | null> => {
    await wait(200)

    const item = digitizationQueue.find((entry) => entry.id === id)
    if (!item || item.status === 'discarded') {
      return null
    }

    const nextProgress = Math.min(item.progress + 35, 100)
    const nextStatus = nextProgress >= 100 ? 'processed' : 'processing'
    const extractedData = nextProgress >= 100 ? createMockExtraction(item.filename) : item.extractedData

    const updated: DigitizationItem = {
      ...item,
      progress: nextProgress,
      status: nextStatus,
      extractedData,
    }

    digitizationQueue = digitizationQueue.map((entry) => (entry.id === id ? updated : entry))
    return updated
  },

  approveAndCommit: async (id: string, extractedData: DigitizedExtraction): Promise<DigitizationItem | null> => {
    await wait(220)
    const item = digitizationQueue.find((entry) => entry.id === id)
    if (!item) return null

    const updated: DigitizationItem = {
      ...item,
      status: 'processed',
      progress: 100,
      extractedData,
      verification: {
        reviewedBy: 'Admin Operator',
        reviewedAt: new Date(),
      },
    }

    digitizationQueue = digitizationQueue.map((entry) => (entry.id === id ? updated : entry))
    committedDocuments.push({ id, committedAt: new Date(), payload: extractedData })
    return updated
  },

  flagForRescan: async (id: string): Promise<DigitizationItem | null> => {
    await wait(220)
    const item = digitizationQueue.find((entry) => entry.id === id)
    if (!item) return null

    const updated: DigitizationItem = {
      ...item,
      status: 'rescanned',
      progress: 100,
      verification: {
        reviewedBy: 'Admin Operator',
        reviewedAt: new Date(),
        notes: 'Flagged for rescan by reviewer.',
      },
    }

    digitizationQueue = digitizationQueue.map((entry) => (entry.id === id ? updated : entry))
    return updated
  },

  discard: async (id: string): Promise<DigitizationItem | null> => {
    await wait(220)
    const item = digitizationQueue.find((entry) => entry.id === id)
    if (!item) return null

    const updated: DigitizationItem = {
      ...item,
      status: 'discarded',
      progress: 100,
    }

    digitizationQueue = digitizationQueue.map((entry) => (entry.id === id ? updated : entry))
    return updated
  },

  getCommittedCount: async (): Promise<number> => {
    await wait(100)
    return committedDocuments.length
  },
}
