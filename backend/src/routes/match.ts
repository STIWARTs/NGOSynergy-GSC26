import { Router, Request, Response } from 'express'
import { matchingService } from '../services/matchingService.js'
import { firebaseService } from '../services/firebaseService.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import { MatchCalculateSchema } from '../schemas/index.js'

const router = Router()

// Calculate volunteer matches for an incident
router.post('/calculate', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const validation = MatchCalculateSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.flatten() })
    }

    const matches = await matchingService.calculateMatches(
      validation.data.incidentId,
      validation.data.limit ?? 10,
      validation.data.radiusKm ?? 30
    )
    res.json({
      incidentId: validation.data.incidentId,
      matches,
      totalProcessed: matches.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Matching error:', error)
    res.status(500).json({ error: error.message || 'Matching calculation failed' })
  }
})

// Deploy a volunteer to an incident
router.post('/deploy', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { incidentId, volunteerId } = req.body

    if (!incidentId || !volunteerId) {
      return res.status(400).json({ error: 'Missing incidentId or volunteerId' })
    }

    // Create assignment
    const assignmentId = await firebaseService.createAssignment({
      incidentId,
      volunteerId,
      status: 'dispatched',
    })

    // Update incident status
    await firebaseService.updateIncident(incidentId, { status: 'verified' })

    // Update volunteer status
    await firebaseService.updateVolunteer(volunteerId, { status: 'deployed' })

    res.json({
      success: true,
      assignmentId,
      message: 'Volunteer deployed successfully',
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Deployment failed' })
  }
})

// Get matching history for an incident
router.get('/history/:incidentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const incident = await firebaseService.getIncident(req.params.incidentId)
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' })
    }

    res.json({
      incidentId: req.params.incidentId,
      lastMatched: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matching history' })
  }
})

export default router
