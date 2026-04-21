import { Router, Request, Response } from 'express'
import { geminiService } from '../services/geminiService.js'
import { documentAiService } from '../services/documentAiService.js'
import { firebaseService } from '../services/firebaseService.js'
import { ReportSubmissionSchema } from '../schemas/index.js'

const router = Router()

// Public endpoint: Submit crisis report with photo verification
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const validation = ReportSubmissionSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.flatten() })
    }

    const { category, severity, coordinates, photoUrl, reporterName, description, affectedCount } =
      validation.data

    // Step 1: Verify photo authenticity with Gemini
    const photoVerification = await geminiService.verifyPhotoAuthenticity(photoUrl)

    if (!photoVerification.verified && photoVerification.confidence < 40) {
      return res.status(400).json({
        error: 'Photo verification failed',
        confidence: photoVerification.confidence,
        reason: photoVerification.reasoning,
      })
    }

    // Step 2: Calculate urgency score
    const urgencyScore = (severity / 5) * 100

    // Step 3: Save to Firestore
    const incidentId = await firebaseService.createIncident({
      category,
      severity,
      coordinates,
      photoUrl,
      urgencyScore,
      verified: photoVerification.confidence > 70,
      geminiVerified: photoVerification.verified,
      reporterName: reporterName || 'Anonymous',
      description: description || '',
      affectedCount: affectedCount || 0,
      title: `${category} - ${new Date().toLocaleDateString()}`,
      location: 'Location TBD',
      timestamp: new Date().toISOString(),
    })

    res.status(201).json({
      success: true,
      incidentId,
      message: 'Report submitted successfully',
      verification: {
        photoVerified: photoVerification.verified,
        confidence: photoVerification.confidence,
      },
    })
  } catch (error: any) {
    console.error('Report submission error:', error)
    res.status(500).json({ error: error.message || 'Failed to submit report' })
  }
})

// Public endpoint: Get public reports for community verification
router.get('/public', async (req: Request, res: Response) => {
  try {
    const reports = await firebaseService.getIncidentsByStatus('pending')
    const publicReports = reports.slice(0, 5).map((r) => ({
      id: r.id,
      category: r.category,
      location: r.location,
      timestamp: r.timestamp,
      affectedCount: r.affectedCount,
      description: r.description,
      photoUrl: r.photoUrl,
    }))

    res.json(publicReports)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public reports' })
  }
})

export default router
