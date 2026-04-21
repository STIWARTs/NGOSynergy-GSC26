import { geoService } from './geoService.js'
import { aiService } from './aiService.js'
import { firebaseService } from './firebaseService.js'
import { MatchResult } from '../types/index.js'

export const matchingService = {
  async calculateMatches(
    incidentId: string,
    limit: number = 10
  ): Promise<MatchResult[]> {
    try {
      // Fetch incident
      const incident = await firebaseService.getIncident(incidentId)
      if (!incident) {
        throw new Error(`Incident ${incidentId} not found`)
      }

      // Fetch all active volunteers
      const volunteers = await firebaseService.getActiveVolunteers()
      if (volunteers.length === 0) {
        return []
      }

      // Phase 1: Filter by proximity
      const proximateVolunteers = await geoService.filterByProximity(
        incident,
        volunteers,
        30 // 30 km radius
      )

      if (proximateVolunteers.length === 0) {
        return []
      }

      // Phase 1.5: Inject proximity scores
      const withProximity = geoService.injectProximityScore(proximateVolunteers)

      // Phase 2: Quick math-based scoring (hardcoded filtering)
      const config = await firebaseService.getGlobalConfig()

      const quickScored = withProximity.map((v) => {
        // Calculate component scores
        const skillScore = matchingService.calculateSkillMatch(v.skills, incident.category)
        const proximityScore = v.proximityScore || 0.5
        const reliabilityScore = v.reliabilityScore || 0.5
        const certificationScore = v.certifications?.length > 0 ? 1 : 0

        // Weighted combination
        const quickScore =
          skillScore * config.a +
          proximityScore * config.b +
          reliabilityScore * config.c +
          certificationScore * config.d

        return {
          id: v.id,
          name: v.name,
          email: v.email,
          distance: v.distance,
          skillScore,
          proximityScore,
          reliabilityScore,
          certificationScore,
          skills: v.skills,
          certifications: v.certifications,
          reliability: v.reliabilityScore,
          quickScore,
        }
      })

      // Keep top candidates for AI ranking (typically top 20)
      const topCandidates = quickScored.sort((a, b) => b.quickScore - a.quickScore).slice(0, 20)

      // Phase 3: AI-powered final ranking
      const aiRanked = await aiService.rankVolunteers(topCandidates, config)

      // Format results
      const results: MatchResult[] = aiRanked.slice(0, limit).map((v: any) => ({
        volunteerId: v.id,
        name: v.name,
        matchScore: Math.round((v.priorityConfidence || (v.quickScore || 0) * 100) * 10) / 10,
        skills: v.skills || [],
        distance: v.distance || 0,
        reliability: v.reliability || v.reliabilityScore || 0,
        reasoning: matchingService.generateReasoning(v, incident),
        priorityConfidence: v.priorityConfidence || (v.quickScore || 0) * 100,
      }))

      return results
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
