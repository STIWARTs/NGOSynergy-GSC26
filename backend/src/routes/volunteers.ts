import { Router, Request, Response } from 'express'
import { firebaseService } from '../services/firebaseService.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import { Volunteer } from '../types/index.js'

const router = Router()

// List volunteers with optional search, status filter, and pagination
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string)?.toLowerCase() || ''
    const status = (req.query.status as string) || ''
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20

    let volunteers = await firebaseService.getAllVolunteers()

    if (status) {
      volunteers = volunteers.filter((v) => v.status === status)
    }

    if (search) {
      volunteers = volunteers.filter((v) => v.name?.toLowerCase().includes(search))
    }

    const total = volunteers.length
    const startIndex = (page - 1) * pageSize
    const paginated = volunteers.slice(startIndex, startIndex + pageSize)

    res.json({
      volunteers: paginated,
      total,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Failed to fetch volunteers:', error)
    res.status(500).json({ error: 'Failed to fetch volunteers' })
  }
})

// Get single volunteer by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const volunteer = await firebaseService.getVolunteer(req.params.id)
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' })
    }
    res.json(volunteer)
  } catch (error) {
    console.error('Failed to fetch volunteer:', error)
    res.status(500).json({ error: 'Failed to fetch volunteer' })
  }
})

export default router
