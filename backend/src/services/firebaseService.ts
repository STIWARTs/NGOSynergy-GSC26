import admin from 'firebase-admin'
import { Incident, Volunteer, Assignment, GlobalConfig } from '../types/index.js'

const db = admin.firestore()

export const firebaseService = {
  // Incidents
  async getIncident(incidentId: string): Promise<Incident | null> {
    const doc = await db.collection('incidents').doc(incidentId).get()
    return (doc.data() as Incident) || null
  },

  async createIncident(incident: Partial<Incident>): Promise<string> {
    const docRef = await db.collection('incidents').add({
      ...incident,
      timestamp: admin.firestore.Timestamp.now(),
      status: 'pending',
    })
    return docRef.id
  },

  async updateIncident(incidentId: string, updates: Partial<Incident>): Promise<void> {
    await db.collection('incidents').doc(incidentId).update(updates)
  },

  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    const snapshot = await db.collection('incidents').where('status', '==', status).get()
    return snapshot.docs.map((doc) => doc.data() as Incident)
  },

  async getHighUrgencyIncidents(threshold: number = 70): Promise<Incident[]> {
    const snapshot = await db
      .collection('incidents')
      .where('urgencyScore', '>=', threshold)
      .where('status', '!=', 'resolved')
      .get()
    return snapshot.docs.map((doc) => doc.data() as Incident)
  },

  // Volunteers
  async getVolunteer(volunteerId: string): Promise<Volunteer | null> {
    const doc = await db.collection('volunteers').doc(volunteerId).get()
    return (doc.data() as Volunteer) || null
  },

  async getActiveVolunteers(): Promise<Volunteer[]> {
    const snapshot = await db.collection('volunteers').where('status', '==', 'active').get()
    return snapshot.docs.map((doc) => doc.data() as Volunteer)
  },

  async getAllVolunteers(): Promise<Volunteer[]> {
    const snapshot = await db.collection('volunteers').get()
    return snapshot.docs.map((doc) => doc.data() as Volunteer)
  },

  async updateVolunteer(volunteerId: string, updates: Partial<Volunteer>): Promise<void> {
    await db.collection('volunteers').doc(volunteerId).update(updates)
  },

  // Assignments
  async createAssignment(assignment: Partial<Assignment>): Promise<string> {
    const docRef = await db.collection('assignments').add({
      ...assignment,
      startTime: admin.firestore.Timestamp.now(),
    })
    return docRef.id
  },

  async getAssignment(assignmentId: string): Promise<Assignment | null> {
    const doc = await db.collection('assignments').doc(assignmentId).get()
    return (doc.data() as Assignment) || null
  },

  async updateAssignment(assignmentId: string, updates: Partial<Assignment>): Promise<void> {
    await db.collection('assignments').doc(assignmentId).update(updates)
  },

  // Global Config
  async getGlobalConfig(): Promise<GlobalConfig> {
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
    await db.collection('globalConfig').doc('ai_weights').update(config)
  },

  // Digitization Queue
  async getDigitizationQueue(): Promise<any[]> {
    const snapshot = await db.collection('digitization_queue').get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  },

  // Verification Items
  async getVerificationItem(itemId: string): Promise<any | null> {
    const doc = await db.collection('verifications').doc(itemId).get()
    return doc.exists ? { id: doc.id, ...doc.data() } : null
  },

  async updateVerificationItem(itemId: string, updates: any): Promise<void> {
    await db.collection('verifications').doc(itemId).update(updates)
  },

  // Stats
  async getStats(): Promise<{
    activeFieldworkers: number
    pendingDigitization: number
    highUrgencyTasks: number
    avgResponseTime: number
  }> {
    const volunteersSnapshot = await db.collection('volunteers').where('status', '==', 'active').get()
    const highUrgencySnapshot = await db
      .collection('incidents')
      .where('urgencyScore', '>=', 70)
      .where('status', '!=', 'resolved')
      .get()

    return {
      activeFieldworkers: volunteersSnapshot.size,
      pendingDigitization: 0, // Would be tracked separately
      highUrgencyTasks: highUrgencySnapshot.size,
      avgResponseTime: 24,
    }
  },
}
