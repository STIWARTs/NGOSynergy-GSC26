export interface Incident {
  id: string
  title: string
  category: string
  location: string
  latitude: number
  longitude: number
  severity: number
  impact: number
  urgencyScore: number
  timestamp: Date
  status: 'active' | 'pending' | 'resolved'
  reporterName: string
  description: string
  affectedCount: number
  photoUrl?: string
  verified: boolean
  vertexVerified: boolean
}

export interface Volunteer {
  id: string
  name: string
  skills: string[]
  distance: number
  reliability: number
  status: 'active' | 'inactive' | 'deployed'
  avatarInitials: string
  contact: string
  certifications: string[]
  pastDeployments: number
}

export interface DigitizationItem {
  id: string
  filename: string
  pageCount: number
  status: 'pending' | 'uploading' | 'processing' | 'processed' | 'failed' | 'rescanned' | 'discarded'
  uploadedAt: Date
  imageUrl: string
  progress: number
  source: 'batch' | 'single'
  extractedData: DigitizedExtraction | null
  verification?: DigitizationVerification
}

export interface DigitizedExtraction {
  incidentType?: string
  location?: string
  date?: string
  severity?: string
  reporterName?: string
  description?: string
  affectedCount?: string
}

export interface DigitizationVerification {
  reviewedBy?: string
  reviewedAt?: Date
  notes?: string
}

export interface VerificationItem {
  id: string
  reporterName: string
  incidentType: string
  timestamp: Date
  location: string
  photoUrl: string
  reportText: string
  aiAnalysis: string
  reportedLocation: { lat: number; lng: number }
  submissionLocation: { lat: number; lng: number }
  communityConfirmations: number
  status: 'pending' | 'verified' | 'rejected'
}

export interface AIWeights {
  skillMatch: number
  proximity: number
  availability: number
  reliability: number
}

export interface UrgencyMultipliers {
  impact: number
  severity: number
}

export interface MatchResult {
  volunteerId: string
  name: string
  avatarInitials: string
  matchScore: number
  skills: string[]
  distance: number
  reliability: number
  reasoning: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatarInitials: string
}
