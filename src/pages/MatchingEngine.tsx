import { useMemo, useState } from 'react'
import { mockIncidents, mockVolunteers } from '@/lib/mockData'
import { useAIWeights } from '@/context/AIWeightsContext'
import { toast } from 'sonner'

export default function MatchingEngine() {
  const [incidentId, setIncidentId] = useState(mockIncidents[0]?.id ?? '')
  const { weights } = useAIWeights()

  const selectedIncident = useMemo(
    () => mockIncidents.find((incident) => incident.id === incidentId),
    [incidentId]
  )

  const rankedVolunteers = useMemo(() => {
    if (!selectedIncident) return []

    return mockVolunteers
      .map((volunteer) => {
        const skillScore = volunteer.skills.some((skill) =>
          selectedIncident.category.toLowerCase().includes(skill.toLowerCase())
        )
          ? 1
          : 0.4

        const proximityScore = Math.max(0, 1 - volunteer.distance / 3)
        const availabilityScore = volunteer.status === 'active' ? 1 : volunteer.status === 'deployed' ? 0.3 : 0
        const reliabilityScore = volunteer.reliability

        const weightedScore =
          skillScore * weights.skillMatch +
          proximityScore * weights.proximity +
          availabilityScore * weights.availability +
          reliabilityScore * weights.reliability

        return {
          ...volunteer,
          matchScore: Math.round(weightedScore * 100),
        }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [selectedIncident, weights])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-mono font-semibold text-text-primary">Matching Engine</h1>

      <div className="bg-surface border border-border rounded-lg p-4">
        <label className="block text-xs text-text-muted mb-2">Select incident</label>
        <select
          value={incidentId}
          onChange={(e) => setIncidentId(e.target.value)}
          className="w-full bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
        >
          {mockIncidents.map((incident) => (
            <option key={incident.id} value={incident.id}>
              {incident.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[65vh]">
        <div className="bg-surface border border-border rounded-lg p-4">
          <h2 className="font-mono text-text-primary mb-3">Incident Details</h2>
          {selectedIncident && (
            <div className="space-y-2 text-sm">
              <p className="text-text-primary">{selectedIncident.title}</p>
              <p className="text-text-muted">{selectedIncident.location}</p>
              <p className="text-text-muted">Category: {selectedIncident.category}</p>
              <p className="text-text-muted">Urgency: {selectedIncident.urgencyScore}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-4">
          <h2 className="font-mono text-text-primary mb-3">Recommended Volunteers</h2>
          <div className="space-y-2">
            {rankedVolunteers.slice(0, 8).map((volunteer) => (
              <div
                key={volunteer.id}
                className="flex items-center justify-between border border-border rounded px-3 py-2"
              >
                <div>
                  <p className="text-sm text-text-primary font-medium">{volunteer.name}</p>
                  <p className="text-xs text-text-muted">
                    {volunteer.skills.slice(0, 2).join(', ')} · {volunteer.distance} km
                  </p>
                </div>
                <span className="text-sm font-mono text-action">{volunteer.matchScore}%</span>
                <button
                  className="ml-3 px-3 py-1 rounded bg-action text-white text-xs"
                  onClick={() =>
                    toast.message('Volunteer Deployed Successfully', {
                      description: `${volunteer.name} assigned to ${selectedIncident?.title ?? 'incident'}`,
                    })
                  }
                >
                  Deploy Volunteer
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
