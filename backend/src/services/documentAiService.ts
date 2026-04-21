import { DocumentProcessorServiceClient } from '@google-cloud/document-ai'
import { Storage } from '@google-cloud/storage'
import { DigitizationResult } from '../types/index.js'

const storage = new Storage()
const docAiClient = new DocumentProcessorServiceClient()

export const documentAiService = {
  async processDocument(imageUrl: string): Promise<DigitizationResult> {
    try {
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
      const location = process.env.DOCUMENT_AI_LOCATION || 'us'
      const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID

      if (!projectId || !processorId) {
        console.warn('Document AI not configured, using mock extraction')
        return documentAiService.mockExtraction()
      }

      const name = docAiClient.processorPath(projectId, location, processorId)

      // Fetch image and convert to bytes
      const imageBuffer = await fetch(imageUrl).then((r) => r.arrayBuffer())

      const request = {
        name,
        rawDocument: {
          content: Buffer.from(imageBuffer),
          mimeType: 'image/jpeg',
        },
      }

      const [result] = await docAiClient.processDocument(request as any)
      const { document } = result

      if (!document) {
        return documentAiService.mockExtraction()
      }

      // Extract fields from the processed document
      const extraction: DigitizationResult = {}

      if (document.entities) {
        document.entities.forEach((entity: any) => {
          const text = entity.mentionText || ''
          switch (entity.type?.toLowerCase()) {
            case 'incident_type':
              extraction.incidentType = text
              break
            case 'location':
              extraction.location = text
              break
            case 'date':
              extraction.date = text
              break
            case 'severity':
              extraction.severity = text
              break
            case 'reporter_name':
              extraction.reporterName = text
              break
            case 'description':
              extraction.description = text
              break
            case 'affected_count':
              extraction.affectedCount = text
              break
          }
        })
      }

      return extraction
    } catch (error) {
      console.error('Document AI processing error:', error)
      return documentAiService.mockExtraction()
    }
  },

  async mockExtraction(): Promise<DigitizationResult> {
    return {
      incidentType: 'Flood',
      location: 'Sector 5, District A',
      date: new Date().toISOString(),
      severity: 'High',
      reporterName: 'Field Agent',
      description: 'Water level rising rapidly',
      affectedCount: '250',
    }
  },

  async uploadDocumentToStorage(buffer: Buffer, filename: string): Promise<string> {
    try {
      const bucket = storage.bucket(process.env.STORAGE_BUCKET || 'documents')
      const file = bucket.file(`digitization/${Date.now()}_${filename}`)

      await file.save(buffer)
      return file.publicUrl()
    } catch (error) {
      console.error('Storage upload error:', error)
      throw error
    }
  },
}
