/**
 * Crises Route — serves prioritized crisis data from Firestore
 * Data is populated by the Data Digitization Pipeline (pipelineService)
 */

import { Router, Request, Response } from 'express'
import { pipelineService } from '../services/pipelineService.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'

const router = Router()

/**
 * GET /api/crises
 * Returns all crises sorted by priorityScore (highest first)
 * This is the main endpoint for the Dashboard "Prioritized Issues" panel
 */
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50
    const category = req.query.category as string | undefined

    let crises
    if (category) {
      crises = await pipelineService.getCrisesByCategory(category)
    } else {
      crises = await pipelineService.getAllCrises(limit)
    }

    res.json({
      crises,
      total: crises.length,
      timestamp: new Date().toISOString(),
      sortedBy: 'priorityScore',
    })
  } catch (error: any) {
    console.error('Failed to fetch crises:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch crises' })
  }
})

/**
 * PATCH /api/crises/:id/status
 * Update a crisis status (e.g., "pending" → "active" → "resolved")
 */
router.patch('/:id/status', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'active', 'resolved', 'dismissed']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` })
    }

    await pipelineService.updateCrisisStatus(id, status)

    res.json({
      success: true,
      id,
      status,
      message: `Crisis ${id} status updated to ${status}`,
    })
  } catch (error: any) {
    console.error('Failed to update crisis status:', error)
    res.status(500).json({ error: error.message || 'Failed to update crisis status' })
  }
})

export default router
