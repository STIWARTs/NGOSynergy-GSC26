import { Router, Request, Response } from 'express'
import { documentAiService } from '../services/documentAiService.js'
import { firebaseService } from '../services/firebaseService.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'

const router = Router()

// Upload document for digitization
router.post('/upload', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { imageUrl, filename } = req.body

    if (!imageUrl || !filename) {
      return res.status(400).json({ error: 'Missing imageUrl or filename' })
    }

    // Process document with Document AI
    const extractedData = await documentAiService.processDocument(imageUrl)

    res.json({
      success: true,
      filename,
      extractedData,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Digitization error:', error)
    res.status(500).json({ error: error.message || 'Digitization failed' })
  }
})

// Get digitization queue
router.get('/queue', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const items = await firebaseService.getDigitizationQueue()
    res.json({
      items,
      total: items.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Queue fetch error:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch digitization queue' })
  }
})

// Commit digitized data as incident
router.post('/commit', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { extractedData } = req.body

    if (!extractedData) {
      return res.status(400).json({ error: 'Missing extractedData' })
    }

    // Create incident from digitized data
    const incidentId = await firebaseService.createIncident({
      category: extractedData.incidentType || 'Unknown',
      severity: extractedData.severity ? parseInt(extractedData.severity) : 3,
      reporterName: extractedData.reporterName || 'Field Report',
      description: extractedData.description || '',
      affectedCount: extractedData.affectedCount ? parseInt(extractedData.affectedCount) : 0,
      location: extractedData.location || '',
      coordinates: { lat: 0, lng: 0 }, // Would need geocoding
      photoUrl: '',
      urgencyScore: 50,
      verified: true,
      geminiVerified: false,
      title: `${extractedData.incidentType || 'Report'} - Digitized`,
      timestamp: new Date().toISOString(),
    })

    res.json({
      success: true,
      incidentId,
      message: 'Document committed as incident',
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to commit document' })
  }
})

export default router
