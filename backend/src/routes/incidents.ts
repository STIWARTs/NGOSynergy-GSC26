import { Router, Request, Response } from 'express'
import { firebaseService } from '../services/firebaseService.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'

const router = Router()

// Get all incidents (admin only)
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined
    let incidents
    if (status) {
      incidents = await firebaseService.getIncidentsByStatus(status)
    } else {
      // Return all incidents (all statuses)
      incidents = await firebaseService.getAllIncidents()
    }
    res.json(incidents)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' })
  }
})

// Get high urgency incidents
router.get('/high-urgency', authMiddleware, async (req: Request, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 70
    const incidents = await firebaseService.getHighUrgencyIncidents(threshold)
    res.json(incidents)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch high urgency incidents' })
  }
})

// Get incident by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const incident = await firebaseService.getIncident(req.params.id)
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' })
    }
    res.json(incident)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incident' })
  }
})

// Get dashboard stats
router.get('/stats/dashboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = await firebaseService.getStats()
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
