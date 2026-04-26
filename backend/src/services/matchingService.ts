import { geoService } from './geoService.js'
import { aiService } from './aiService.js'
import { firebaseService } from './firebaseService.js'
import { MatchResult } from '../types/index.js'

export const matchingService = {
  async calculateMatches(
    incidentId: string,
    limit: number = 10,
    radiusKm: number = 30
  ): Promise<MatchResult[]> {
    try {
      // Fetch incident
      const incident = await firebaseService.getIncident(incidentId)
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found`)
      }

      // Fetch all volunteers (frontend will handle status filtering)
      const volunteers = await firebaseService.getAllVolunteers()
      if (volunteers.length === 0) {
        return []
      }

      // Phase 1: Filter by proximity
      const proximateVolunteers = await geoService.filterByProximity(
        incident,
        volunteers,
        radiusKm
      )

      if (proximateVolunteers.length === 0) {
        return []
      }

      // Phase 1.5: Inject proximity scores
      const withProximity = geoService.injectProximityScore(proximateVolunteers)

      // Phase 2: Quick math-based scoring (hardcoded filtering) - COMMENTED OUT
      // const config = await firebaseService.getGlobalConfig()
      // ...
      // Phase 3: AI-powered final ranking - COMMENTED OUT
      // const aiRanked = await aiService.rankVolunteers(topCandidates, config)

      // Format results based ONLY on distance
      const results: MatchResult[] = proximateVolunteers.map((v: any) => ({
        volunteerId: v.id,
        name: v.name,
        matchScore: 100 - (v.distance * 2), // Mock score based purely on distance (closer = higher score)
        skills: v.skills || [],
        distance: v.distance || 0,
        reliability: v.reliabilityScore || 0,
        reasoning: `Within radius: ${v.distance} km from incident.`,
        priorityConfidence: 100 - (v.distance * 2),
      }))

      // Sort by distance (closest first)
      results.sort((a, b) => a.distance - b.distance)

      return results.slice(0, limit)
    } catch (error) {
      console.error('Matching calculation error:', error)
      throw error
    }
  },

  calculateSkillMatch(volunteerSkills: string[], incidentCategory: string): number {
    if (!volunteerSkills || volunteerSkills.length === 0) {
      return 0.3 // Base score if no skills
    }

    const categoryKeywords = incidentCategory.toLowerCase().split(/\s+/)
    const matchedSkills = volunteerSkills.filter((skill) =>
      categoryKeywords.some((keyword) => skill.toLowerCase().includes(keyword))
    )

    return Math.min(1, (matchedSkills.length / volunteerSkills.length) * 1.5 + 0.3)
  },

  generateReasoning(volunteer: any, incident: any): string {
    const parts: string[] = []

    if (volunteer.skillScore > 0.7) {
      parts.push(`strong ${volunteer.skills?.[0] || 'technical'} skill match`)
    }

    if (volunteer.distance < 5) {
      parts.push(`very close proximity (${volunteer.distance} km)`)
    } else if (volunteer.distance < 15) {
      parts.push(`reasonable proximity (${volunteer.distance} km)`)
    }

    if (volunteer.reliability > 0.8) {
      parts.push('excellent historical reliability')
    }

    if (volunteer.certifications?.length > 0) {
      parts.push('certified professional')
    }

    return `Prioritized due to ${parts.join(', ')}.`
  },
}
