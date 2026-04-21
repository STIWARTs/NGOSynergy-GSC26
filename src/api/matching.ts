import { mockVolunteers } from '@/lib/mockData'
import { MatchResult } from '@/types'

export const matchingService = {
  async getResults(): Promise<MatchResult[]> {
    return mockVolunteers.slice(0, 3).map((volunteer) => ({
      volunteerId: volunteer.id,
      name: volunteer.name,
      avatarInitials: volunteer.avatarInitials,
      matchScore: Math.round(volunteer.reliability * 100),
      skills: volunteer.skills,
      distance: volunteer.distance,
      reliability: volunteer.reliability,
      reasoning: `Prioritized for ${volunteer.skills[0]} skill, ${volunteer.distance}km proximity, and ${Math.round(
        volunteer.reliability * 100
      )}% reliability.`,
    }))
  },
}
