import { Router, Request, Response } from 'express'
import { geminiService } from '../services/geminiService.js'
import { firebaseService } from '../services/firebaseService.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'

const router = Router()

// Get verification items pending review
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const items = await firebaseService.getVerifications()
    res.json(items)
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

    const item = await firebaseService.getVerificationItem(id)
    if (!item) {
      return res.status(404).json({ error: 'Verification item not found' })
    }

    await firebaseService.updateVerificationItem(id, { status: 'approved' })

    res.json({
      success: true,
      message: `Report ${id} approved`,
      item: { ...item, status: 'approved' },
    })
  } catch (error) {
    console.error('Approve error:', error)
    res.status(500).json({ error: 'Failed to approve report' })
  }
})

// Reject suspicious report
router.post('/reject/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const item = await firebaseService.getVerificationItem(id)
    if (!item) {
      return res.status(404).json({ error: 'Verification item not found' })
    }

    await firebaseService.updateVerificationItem(id, { status: 'rejected' })

    res.json({
      success: true,
      message: `Report ${id} rejected`,
      item: { ...item, status: 'rejected' },
    })
  } catch (error) {
    console.error('Reject error:', error)
    res.status(500).json({ error: 'Failed to reject report' })
  }
})

export default router
