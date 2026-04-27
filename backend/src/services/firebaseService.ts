import admin from 'firebase-admin'
import { Incident, Volunteer, Assignment, GlobalConfig } from '../types/index.js'
import {
  mockIncidents,
  mockVolunteers,
  mockAssignments,
  mockGlobalConfig,
  mockDigitizationQueue,
  mockVerifications,
} from '../lib/mockData.js'

let firestoreAvailable: boolean | null = null

function getDb() {
  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin is not initialized.')
  }
  return admin.firestore() // Connects to real Firebase
}

async function firestoreFallback<T>(
  dbCall: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const result = await dbCall()
    firestoreAvailable = true
    return result
  } catch (err) {
    console.error('Firestore call failed, falling back to mock data:', (err as Error).message)
    firestoreAvailable = false
    return fallback
  }
}

export const firebaseService = {
  // Incidents
  async getIncident(incidentId: string): Promise<Incident | null> {
    return firestoreFallback(async () => {
      const db = getDb()
      if (!db) return mockIncidents.find((i) => i.id === incidentId) || null
      const doc = await db.collection('incidents').doc(incidentId).get()
      return (doc.data() as Incident) || null
    }, mockIncidents.find((i) => i.id === incidentId) || null)
  },

  async createIncident(incident: Partial<Incident>): Promise<string> {
    const db = getDb()
    if (!db) {
      const id = String(mockIncidents.length + 1)
      mockIncidents.push({
        ...(incident as Incident),
        id,
        timestamp: new Date().toISOString(),
        status: 'pending',
      })
      return id
    }
    const docRef = await db.collection('incidents').add({
      ...incident,
      timestamp: admin.firestore.Timestamp.now(),
      status: 'pending',
    })
    return docRef.id
  },

  async updateIncident(incidentId: string, updates: Partial<Incident>): Promise<void> {
    const db = getDb()
    if (!db) {
      const idx = mockIncidents.findIndex((i) => i.id === incidentId)
      if (idx >= 0) {
        mockIncidents[idx] = { ...mockIncidents[idx], ...updates }
      }
      return
    }
    await db.collection('incidents').doc(incidentId).update(updates)
  },

  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    return firestoreFallback(async () => {
      const db = getDb()
      if (!db) return mockIncidents.filter((i) => i.status === status)
      const snapshot = await db.collection('incidents').where('status', '==', status).get()
      return snapshot.docs.map((doc) => doc.data() as Incident)
    }, mockIncidents.filter((i) => i.status === status))
  },

  async getAllIncidents(): Promise<Incident[]> {
    return firestoreFallback(async () => {
      const db = getDb()
      if (!db) return [...mockIncidents]
      const snapshot = await db.collection('incidents').get()
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Incident))
    }, [...mockIncidents])
  },

  async getHighUrgencyIncidents(threshold: number = 70): Promise<Incident[]> {
    return firestoreFallback(async () => {
      const db = getDb()
      if (!db) return mockIncidents.filter((i) => i.urgencyScore >= threshold && i.status !== 'resolved')
      const snapshot = await db.collection('incidents').where('urgencyScore', '>=', threshold).get()
      return snapshot.docs
        .map((doc) => ({ ...(doc.data() as Incident), id: doc.id } as Incident))
        .filter((incident) => incident.status !== 'resolved')
    }, mockIncidents.filter((i) => i.urgencyScore >= threshold && i.status !== 'resolved'))
  },

  // Volunteers
  async getVolunteer(volunteerId: string): Promise<Volunteer | null> {
    return firestoreFallback(async () => {
      const db = getDb()
      if (!db) return mockVolunteers.find((v) => v.id === volunteerId) || null
      const doc = await db.collection('volunteers').doc(volunteerId).get()
      return (doc.data() as Volunteer) || null
    }, mockVolunteers.find((v) => v.id === volunteerId) || null)
  },

  async getActiveVolunteers(): Promise<Volunteer[]> {
    return firestoreFallback(async () => {
      const db = getDb()
      if (!db) return mockVolunteers.filter((v) => v.status === 'active')
      const snapshot = await db.collection('volunteers').where('status', '==', 'active').get()
      return snapshot.docs.map((doc) => doc.data() as Volunteer)
    }, mockVolunteers.filter((v) => v.status === 'active'))
  },

  async getAllVolunteers(): Promise<Volunteer[]> {
    return firestoreFallback(async () => {
      const db = getDb()
      if (!db) return [...mockVolunteers]
      const snapshot = await db.collection('volunteers').get()
      return snapshot.docs.map((doc) => doc.data() as Volunteer)
    }, [...mockVolunteers])
  },

  async updateVolunteer(volunteerId: string, updates: Partial<Volunteer>): Promise<void> {
    const db = getDb()
    if (!db) {
      const idx = mockVolunteers.findIndex((v) => v.id === volunteerId)
      if (idx >= 0) {
        mockVolunteers[idx] = { ...mockVolunteers[idx], ...updates }
      }
      return
    }
    await db.collection('volunteers').doc(volunteerId).update(updates)
  },

  // Assignments
  async createAssignment(assignment: Partial<Assignment>): Promise<string> {
    const db = getDb()
    if (!db) {
      const id = String(mockAssignments.length + 1)
      mockAssignments.push({
        ...(assignment as Assignment),
        id,
        startTime: new Date().toISOString(),
      })
      return id
    }
    const docRef = await db.collection('assignments').add({
      ...assignment,
      startTime: admin.firestore.Timestamp.now(),
    })
    return docRef.id
  },

  async getAssignment(assignmentId: string): Promise<Assignment | null> {
    const db = getDb()
    if (!db) {
      return mockAssignments.find((a) => a.id === assignmentId) || null
    }
    const doc = await db.collection('assignments').doc(assignmentId).get()
    return (doc.data() as Assignment) || null
  },

  async getAllAssignments(): Promise<Assignment[]> {
    return firestoreFallback(async () => {
      const db = getDb()
      if (!db) return [...mockAssignments]
      const snapshot = await db.collection('assignments').get()
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Assignment))
    }, [...mockAssignments])
  },

  async updateAssignment(assignmentId: string, updates: Partial<Assignment>): Promise<void> {
    const db = getDb()
    if (!db) {
      const idx = mockAssignments.findIndex((a) => a.id === assignmentId)
      if (idx >= 0) {
        mockAssignments[idx] = { ...mockAssignments[idx], ...updates }
      }
      return
    }
    await db.collection('assignments').doc(assignmentId).update(updates)
  },

  // Global Config
  async getGlobalConfig(): Promise<GlobalConfig> {
    const db = getDb()
    if (!db) {
      return { ...mockGlobalConfig }
    }
    const doc = await db.collection('globalConfig').doc('ai_weights').get()
    return (doc.data() as GlobalConfig) || {
      a: 0.4,
      b: 0.3,
      c: 0.2,
      d: 0.1,
      useVertexAI: false,
      endpointId: '',
    }
  },

  async updateGlobalConfig(config: Partial<GlobalConfig>): Promise<void> {
    const db = getDb()
    if (!db) {
      Object.assign(mockGlobalConfig, config)
      return
    }
    await db.collection('globalConfig').doc('ai_weights').update(config)
  },

  // Digitization Queue
  async getDigitizationQueue(): Promise<any[]> {
    const db = getDb()
    if (!db) {
      return [...mockDigitizationQueue]
    }
    const snapshot = await db.collection('digitization_queue').get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  },

  // Verification Items
  async getVerifications(): Promise<any[]> {
    return firestoreFallback(async () => {
      const db = getDb()
      if (!db) return [...mockVerifications]
      const snapshot = await db.collection('verifications').get()
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    }, [...mockVerifications])
  },

  async getVerificationItem(itemId: string): Promise<any | null> {
    const db = getDb()
    if (!db) {
      const item = mockVerifications.find((v) => v.id === itemId)
      return item ? { ...item } : null
    }
    const doc = await db.collection('verifications').doc(itemId).get()
    return doc.exists ? { id: doc.id, ...doc.data() } : null
  },

  async updateVerificationItem(itemId: string, updates: any): Promise<void> {
    const db = getDb()
    if (!db) {
      const idx = mockVerifications.findIndex((v) => v.id === itemId)
      if (idx >= 0) {
        mockVerifications[idx] = { ...mockVerifications[idx], ...updates }
      }
      return
    }
    await db.collection('verifications').doc(itemId).update(updates)
  },

  // Stats
  async getStats(): Promise<{
    activeFieldworkers: number
    pendingIncidents: number
    highUrgencyTasks: number
    avgResponseTime: number
  }> {
    return firestoreFallback(async () => {
      const db = getDb()
      if (!db) {
        return {
          activeFieldworkers: mockVolunteers.filter(v => v.status === 'active').length,
          pendingIncidents: mockIncidents.filter(i => i.status === 'pending').length,
          highUrgencyTasks: mockIncidents.filter(i => i.urgencyScore >= 70 && i.status !== 'resolved').length,
          avgResponseTime: 24,
        }
      }
      const volunteersSnapshot = await db.collection('volunteers').where('status', '==', 'active').get()
      const highUrgencySnapshot = await db.collection('incidents').where('urgencyScore', '>=', 70).get()
      const highUrgencyTasks = highUrgencySnapshot.docs
        .map((doc) => doc.data() as Incident)
        .filter((incident) => incident.status !== 'resolved').length
      
      const pendingIncidentsSnapshot = await db.collection('incidents').where('status', '==', 'pending').get()

      return {
        activeFieldworkers: volunteersSnapshot.size,
        pendingIncidents: pendingIncidentsSnapshot.size,
        highUrgencyTasks,
        avgResponseTime: 24,
      }
    }, {
      activeFieldworkers: mockVolunteers.filter(v => v.status === 'active').length,
      pendingIncidents: mockIncidents.filter(i => i.status === 'pending').length,
      highUrgencyTasks: mockIncidents.filter(i => i.urgencyScore >= 70 && i.status !== 'resolved').length,
      avgResponseTime: 24,
    })
  },
}
