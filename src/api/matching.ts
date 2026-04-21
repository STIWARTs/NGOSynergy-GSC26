import { mockIncidents, mockVolunteers } from '@/lib/mockData'
import { AIWeights, MatchResult } from '@/types'

interface MatchRequestPayload {
  incidentId: string
  weights: AIWeights
}

interface DeployPayload {
  incidentId: string
  volunteerId: string
}

export const matchingService = {
  async getResults(payload: MatchRequestPayload): Promise<MatchResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 250))

    const incident = mockIncidents.find((item) => item.id === payload.incidentId)
    if (!incident) return []

    const rank = mockVolunteers.map((volunteer) => {
      const skillScore = volunteer.skills.some((skill) =>
        incident.category.toLowerCase().includes(skill.toLowerCase())
      )
        ? 1
        : 0.4
      const proximityScore = Math.max(0, 1 - volunteer.distance / 3)
      const availabilityScore = volunteer.status === 'active' ? 1 : volunteer.status === 'deployed' ? 0.3 : 0
      const reliabilityScore = volunteer.reliability

      const weightedScore =
        skillScore * payload.weights.skillMatch +
        proximityScore * payload.weights.proximity +
        availabilityScore * payload.weights.availability +
        reliabilityScore * payload.weights.reliability

      return {
        volunteerId: volunteer.id,
        name: volunteer.name,
        avatarInitials: volunteer.avatarInitials,
        matchScore: Math.round(weightedScore * 100),
        skills: volunteer.skills,
        distance: volunteer.distance,
        reliability: volunteer.reliability,
        reasoning: `Prioritized due to ${volunteer.skills[0]} skill alignment, ${volunteer.distance} km proximity, and ${Math.round(
          volunteer.reliability * 100
        )}% historical reliability.`,
      }
    })

    return rank.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)
  },

  async deployVolunteer(_payload: DeployPayload): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200))
  },
}
