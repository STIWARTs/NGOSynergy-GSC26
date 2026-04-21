import { Router, Request, Response } from 'express'
import { geminiService } from '../services/geminiService.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'

const router = Router()

// Get verification items pending review
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    // Mock data - would fetch from Firestore in production
    res.json([
      {
        id: '1',
        reporterName: 'Field Agent',
        incidentType: 'Flood',
        timestamp: new Date(),
        location: 'Sector 5',
        photoUrl: '',
        reportText: 'Water level rising rapidly',
        status: 'pending',
      },
    ])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch verification items' })
  }
})

// Analyze report with Gemini vision for verification
router.post('/analyze', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { reportText, photoUrl } = req.body

    if (!reportText || !photoUrl) {
      return res.status(400).json({ error: 'Missing reportText or photoUrl' })
    }

    const analysis = await geminiService.analyzeVerificationReport(reportText, photoUrl)

    res.json({
      success: true,
      authenticity: analysis.authenticity,
      description: analysis.description,
      recommendations: analysis.recommendations,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Analysis failed' })
  }
})

// Approve verified report
router.post('/approve/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    res.json({
      success: true,
      message: `Report ${id} approved`,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve report' })
  }
})

// Reject suspicious report
router.post('/reject/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    res.json({
      success: true,
      message: `Report ${id} rejected`,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject report' })
  }
})

export default router
