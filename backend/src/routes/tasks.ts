/**
 * /api/tasks — Volunteer-facing task API
 *
 * Wraps Incidents + Assignments into a volunteer-friendly TaskDTO.
 * Volunteers can:
 *   - List all tasks (filtered by volunteerId / status)
 *   - Get a single task
 *   - Accept a task (creates Assignment, marks incident active)
 *   - Complete a task (closes Assignment, marks incident resolved)
 */

import { Router, Request, Response } from 'express'
import { firebaseService } from '../services/firebaseService.js'
import { authMiddleware, volunteerOnly } from '../middleware/authMiddleware.js'
import { Incident, Assignment } from '../types/index.js'

const router = Router()

// ---------------------------------------------------------------------------
// Helper: map an Incident + optional Assignment → TaskDTO
// ---------------------------------------------------------------------------

interface TaskDTO {
  id: string
  title: string
  location: string
  category: string
  severity: number
  urgencyScore: number
  status: 'pending' | 'active' | 'resolved' | 'verified'
  assignedVolunteerId?: string
  assignedVolunteerName?: string
  description: string
  coordinates: { lat: number; lng: number }
  timestamp: string
  impact?: number
  affectedCount?: number
}

function toTaskDTO(incident: Incident, assignment?: Assignment, volunteerName?: string): TaskDTO {
  return {
    id: incident.id,
    title: incident.title,
    location: incident.location,
    category: incident.category,
    severity: incident.severity,
    urgencyScore: incident.urgencyScore,
    status: incident.status,
    assignedVolunteerId: assignment?.volunteerId,
    assignedVolunteerName: volunteerName,
    description: incident.description ?? '',
    coordinates: incident.coordinates,
    timestamp: incident.timestamp,
    impact: incident.impact,
    affectedCount: incident.affectedCount,
  }
}

// ---------------------------------------------------------------------------
// GET /api/tasks
// Returns all incidents mapped to TaskDTOs.
// Query params:
//   ?volunteerId=<uid>  — only tasks assigned to that volunteer
//   ?status=pending|active|resolved
// ---------------------------------------------------------------------------

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const volunteerIdFilter = req.query.volunteerId as string | undefined
    const statusFilter = req.query.status as string | undefined

    // Fetch all incidents
    let incidents = await firebaseService.getAllIncidents()

    // Fetch all assignments to build a lookup map
    const allAssignments = await firebaseService.getAllAssignments()
    const assignmentByIncident = new Map<string, Assignment>()
    for (const a of allAssignments) {
      assignmentByIncident.set(a.incidentId, a)
    }

    // Apply status filter
    if (statusFilter) {
      incidents = incidents.filter((i) => i.status === statusFilter)
    }

    // Apply volunteer filter (only incidents that have an assignment for this volunteer)
    if (volunteerIdFilter) {
      incidents = incidents.filter((i) => {
        const assignment = assignmentByIncident.get(i.id)
        return assignment?.volunteerId === volunteerIdFilter
      })
    }

    // Build response
    const tasks: TaskDTO[] = incidents.map((incident) => {
      const assignment = assignmentByIncident.get(incident.id)
      return toTaskDTO(incident, assignment)
    })

    res.json(tasks)
  } catch (error: any) {
    console.error('Failed to fetch tasks:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch tasks' })
  }
})

// ---------------------------------------------------------------------------
// GET /api/tasks/:id
// Returns a single task by incident ID.
// ---------------------------------------------------------------------------

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const incident = await firebaseService.getIncident(req.params.id)
    if (!incident) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const allAssignments = await firebaseService.getAllAssignments()
    const assignment = allAssignments.find((a) => a.incidentId === incident.id)

    res.json(toTaskDTO(incident, assignment))
  } catch (error: any) {
    console.error('Failed to fetch task:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch task' })
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/tasks/:id/accept
// A volunteer accepts a pending task.
//   Body: { volunteerId: string }
// Creates an Assignment, sets incident to active.
// ---------------------------------------------------------------------------

router.patch('/:id/accept', authMiddleware, volunteerOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const volunteerId: string = req.body.volunteerId || req.user!.uid

    const incident = await firebaseService.getIncident(id)
    if (!incident) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (incident.status !== 'pending') {
      return res.status(409).json({ error: `Task is already ${incident.status}` })
    }

    // Create the assignment
    const assignmentId = await firebaseService.createAssignment({
      incidentId: id,
      volunteerId,
      status: 'dispatched',
    })

    // Update incident status to active
    await firebaseService.updateIncident(id, { status: 'active' })

    // Mark volunteer as deployed
    await firebaseService.updateVolunteer(volunteerId, { status: 'deployed' })

    res.json({
      success: true,
      assignmentId,
      message: 'Task accepted successfully',
    })
  } catch (error: any) {
    console.error('Failed to accept task:', error)
    res.status(500).json({ error: error.message || 'Failed to accept task' })
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/tasks/:id/complete
// A volunteer marks their accepted task as complete.
//   Body: {} (volunteerId derived from auth token)
// Updates Assignment to completed, incident to resolved.
// ---------------------------------------------------------------------------

router.patch('/:id/complete', authMiddleware, volunteerOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const callerId = req.user!.uid

    const incident = await firebaseService.getIncident(id)
    if (!incident) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (incident.status === 'resolved') {
      return res.status(409).json({ error: 'Task is already resolved' })
    }

    // Find the assignment for this incident
    const allAssignments = await firebaseService.getAllAssignments()
    const assignment = allAssignments.find((a) => a.incidentId === id)

    if (assignment) {
      // Verify the caller owns this assignment (unless they're admin)
      if (req.user?.role !== 'admin' && assignment.volunteerId !== callerId) {
        return res.status(403).json({ error: 'You are not assigned to this task' })
      }

      await firebaseService.updateAssignment(assignment.id, {
        status: 'completed',
        endTime: new Date().toISOString(),
      })

      // Set volunteer back to active
      await firebaseService.updateVolunteer(assignment.volunteerId, { status: 'active' })
    }

    // Resolve the incident
    await firebaseService.updateIncident(id, { status: 'resolved' })

    res.json({
      success: true,
      message: 'Task completed successfully',
    })
  } catch (error: any) {
    console.error('Failed to complete task:', error)
    res.status(500).json({ error: error.message || 'Failed to complete task' })
  }
})

export default router
