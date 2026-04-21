import { Router, Request, Response } from 'express'
import { firebaseService } from '../services/firebaseService.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import { AIWeightsSchema, UrgencyMultipliersSchema } from '../schemas/index.js'

const router = Router()

// Get current AI weights configuration
router.get('/weights', authMiddleware, async (req: Request, res: Response) => {
  try {
    const config = await firebaseService.getGlobalConfig()
    res.json({
      weights: {
        skillMatch: config.a,
        proximity: config.b,
        reliability: config.c,
        certification: config.d,
      },
      useVertexAI: config.useVertexAI,
      endpointId: config.endpointId,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weights' })
  }
})

// Update AI weights (admin only)
router.patch('/weights', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { weights } = req.body

    if (!weights) {
      return res.status(400).json({ error: 'Missing weights object' })
    }

    await firebaseService.updateGlobalConfig({
      a: weights.skillMatch || 0.4,
      b: weights.proximity || 0.3,
      c: weights.reliability || 0.2,
      d: weights.certification || 0.1,
    })

    res.json({
      success: true,
      message: 'Weights updated successfully',
      weights,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update weights' })
  }
})

// Update AI model configuration
router.patch('/model', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { useVertexAI, endpointId } = req.body

    await firebaseService.updateGlobalConfig({
      useVertexAI: useVertexAI ?? false,
      endpointId: endpointId || '',
    })

    res.json({
      success: true,
      message: 'Model configuration updated',
      mode: useVertexAI ? 'vertex-ai' : 'poc',
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update model config' })
  }
})

// Get dashboard stats
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = await firebaseService.getStats()
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
