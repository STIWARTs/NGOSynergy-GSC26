import { Router, Request, Response } from 'express'
import { firebaseService } from '../services/firebaseService.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'
import { Volunteer } from '../types/index.js'
import { geoService } from '../services/geoService.js'

const router = Router()

// List volunteers with optional search, status filter, and pagination
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string)?.toLowerCase() || ''
    const status = (req.query.status as string) || ''
    const skill = (req.query.skill as string)?.toLowerCase() || ''
    const minReliability = Number(req.query.minReliability as string) || 0
    const originLat = req.query.lat !== undefined ? Number(req.query.lat) : undefined
    const originLng = req.query.lng !== undefined ? Number(req.query.lng) : undefined
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20

    let volunteers = await firebaseService.getAllVolunteers()

    if (status) {
      volunteers = volunteers.filter((v) => v.status === status)
    }

    if (search) {
      volunteers = volunteers.filter(
        (v) =>
          v.name?.toLowerCase().includes(search) ||
          v.email?.toLowerCase().includes(search) ||
          (v.skills || []).some((s) => s.toLowerCase().includes(search)) ||
          (v.certifications || []).some((c) => c.toLowerCase().includes(search))
      )
    }

    if (skill) {
      volunteers = volunteers.filter((v) =>
        (v.skills || []).some((s) => s.toLowerCase().includes(skill))
      )
    }

    if (minReliability > 0) {
      volunteers = volunteers.filter((v) => (v.reliabilityScore || 0) >= minReliability)
    }

    // Attach distance if an origin is provided (for directory display & sorting)
    const hasOrigin =
      typeof originLat === 'number' &&
      Number.isFinite(originLat) &&
      typeof originLng === 'number' &&
      Number.isFinite(originLng)

    // If browser location is blocked, still compute distance from a stable reference point
    // (Raipur – used elsewhere in the UI as default center)
    const origin = hasOrigin
      ? { lat: originLat as number, lng: originLng as number }
      : { lat: 21.2514, lng: 81.6296 }

    volunteers = volunteers.map((v) => ({
      ...v,
      distance: v.homeCoordinates
        ? geoService.calculateHaversineDistance(origin, v.homeCoordinates)
        : v.currentCoordinates
          ? geoService.calculateHaversineDistance(origin, v.currentCoordinates)
          : undefined,
    }))

    // Natural sort: "Volunteer 2" before "Volunteer 10"
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
    volunteers.sort((a, b) => collator.compare(a.name || '', b.name || ''))

    const total = volunteers.length
    const startIndex = (page - 1) * pageSize
    const paginated = volunteers.slice(startIndex, startIndex + pageSize)

    res.json({
      items: paginated,
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
