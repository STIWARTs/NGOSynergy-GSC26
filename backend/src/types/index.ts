export interface User {
  uid: string
  email: string
  role: 'admin' | 'volunteer' | 'reporter'
}

export interface Incident {
  id: string
  category: string
  severity: number
  impact?: number
  status: 'pending' | 'verified' | 'resolved' | 'active'
  coordinates: {
    lat: number
    lng: number
  }
  photoUrl?: string
  fileName?: string
  fileType?: string
  urgencyScore: number
  timestamp: string
  verified: boolean
  geminiVerified: boolean
  reporterName: string
  description: string
  affectedCount: number
  title: string
  location: string
}

export interface Volunteer {
  id: string
  name: string
  email: string
  skills: string[]
  status: 'active' | 'inactive' | 'deployed'
  // Volunteer-provided home/base location (not live tracking)
  homeCoordinates: {
    lat: number
    lng: number
  }
  // Optional live location if you add it later
  currentCoordinates?: {
    lat: number
    lng: number
  }
  reliabilityScore: number
  fcmToken: string
  certifications: string[]
  pastDeployments: number
  avatarInitials?: string
  distance?: number
}

export interface Assignment {
  id: string
  incidentId: string
  volunteerId: string
  status: 'dispatched' | 'completed'
  startTime: string
  endTime?: string
}

export interface GlobalConfig {
  a: number
  b: number
  c: number
  d: number
  useVertexAI: boolean
  endpointId: string
}

export interface AIWeights {
  skillMatch: number
  proximity: number
  availability: number
  reliability: number
}

export interface MatchResult {
  volunteerId: string
  name: string
  matchScore: number
  skills: string[]
  distance: number
  reliability: number
  reasoning: string
  priorityConfidence?: number
}

export interface DigitizationResult {
  incidentType?: string
  location?: string
  date?: string
  severity?: string
  reporterName?: string
  description?: string
  affectedCount?: string
}
