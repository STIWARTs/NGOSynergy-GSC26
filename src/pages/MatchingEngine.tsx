import { useEffect, useMemo, useState } from 'react'
import { mockIncidents, mockVolunteers } from '@/lib/mockData'
import { useAIWeights } from '@/context/AIWeightsContext'
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import { Skeleton } from '@/components/shared/Skeleton'
import { emitGlobalToast } from '@/lib/events'
import { useDeployMatch, useMatchResults } from '@/hooks/useMatching'
import SkillBadge from '@/components/shared/SkillBadge'

const mapLibraries: ('visualization')[] = ['visualization']

const darkMapStyle = [
  { stylers: [{ saturation: -100 }, { lightness: -25 }] },
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
]

export default function MatchingEngine() {
  const [incidentId, setIncidentId] = useState(mockIncidents[0]?.id ?? '')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [selectedVolunteerPin, setSelectedVolunteerPin] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  )
  const { weights } = useAIWeights()
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? localStorage.getItem('googleMapsApiKey') ?? ''
  const { isLoaded } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: apiKey,
    libraries: mapLibraries,
  })

  const now = Date.now()
  const highPriorityIncidents = useMemo(() => {
    return mockIncidents
      .filter((incident) => incident.verified)
      .map((incident) => {
        const ageHours = (now - new Date(incident.timestamp).getTime()) / (1000 * 60 * 60)
        const timeFactor = Math.min(12, Math.max(1, ageHours))
        const priorityScore = incident.impact * incident.severity + timeFactor
        return { ...incident, priorityScore }
      })
      .filter((incident) => (categoryFilter === 'all' ? true : incident.category === categoryFilter))
      .filter((incident) =>
        urgencyFilter === 'all'
          ? true
          : urgencyFilter === 'critical'
            ? incident.priorityScore >= 70
            : urgencyFilter === 'high'
              ? incident.priorityScore >= 50
              : incident.priorityScore < 50
      )
      .filter((incident) =>
        zoneFilter === 'all' ? true : incident.location.toLowerCase().includes(zoneFilter.toLowerCase())
      )
      .sort((a, b) => b.priorityScore - a.priorityScore)
  }, [categoryFilter, now, urgencyFilter, zoneFilter])

  const selectedIncident = useMemo(
    () => highPriorityIncidents.find((incident) => incident.id === incidentId) ?? highPriorityIncidents[0],
    [highPriorityIncidents, incidentId]
  )
  const { data: suggestedMatches = [] } = useMatchResults(selectedIncident?.id ?? '', weights)
  const deployMutation = useDeployMatch()

  const rankedVolunteers = useMemo(() => {
    if (!selectedIncident) return []

    return mockVolunteers
      .map((volunteer) => {
        const skillScore = volunteer.skills.some((skill) =>
          selectedIncident.category.toLowerCase().includes(skill.toLowerCase())
        )
          ? 1
          : 0.4

        const proximityScore = Math.max(0, 1 - (volunteer.distance ?? 0) / 3)
        const availabilityScore = volunteer.status === 'active' ? 1 : volunteer.status === 'deployed' ? 0.3 : 0
        const reliabilityScore = volunteer.reliabilityScore

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

  useEffect(() => {
    if (!selectedIncident && highPriorityIncidents[0]) {
      setIncidentId(highPriorityIncidents[0].id)
    }
  }, [highPriorityIncidents, selectedIncident])

  useEffect(() => {
    setLoadingRecommendations(true)
    const timeout = setTimeout(() => setLoadingRecommendations(false), 600)
    return () => clearTimeout(timeout)
  }, [incidentId, weights])

  useEffect(() => {
    const checkTheme = () => {
      const currentTheme = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
      setTheme(currentTheme)
    }

    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('storage', checkTheme)

    return () => {
      observer.disconnect()
      window.removeEventListener('storage', checkTheme)
    }
  }, [])

  const mapStyle = theme === 'light' ? undefined : darkMapStyle
  const displayedRecommendations = suggestedMatches.length > 0 ? suggestedMatches : rankedVolunteers.slice(0, 3)

  return (
    <div className="space-y-4 h-full">
      <h1 className="text-3xl font-mono font-semibold text-text-primary">Matching Engine</h1>

      <div className="bg-surface border border-border rounded-lg p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
        >
          <option value="all">All categories</option>
          {[...new Set(mockIncidents.map((incident) => incident.category))].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
        >
          <option value="all">All urgency</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
        </select>
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
        >
          <option value="all">All zones</option>
          <option value="downtown">Downtown</option>
          <option value="industrial">Industrial</option>
          <option value="north">North</option>
          <option value="zone">Coordination Zones</option>
        </select>
        <div className="text-xs text-text-muted flex items-center px-2">
          Score = (a x SkillMatch) + (b x 1/Distance) + (c x Availability) + (d x PastReliability)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[68vh]">
        <div className="bg-surface border border-border rounded-lg p-4 flex flex-col min-h-0">
          <h2 className="font-mono text-text-primary mb-3">Verified High-Priority Queue</h2>
          <div className="space-y-2 overflow-y-auto">
            {highPriorityIncidents.map((incident) => (
              <button
                key={incident.id}
                onClick={() => setIncidentId(incident.id)}
                className={`w-full text-left border rounded p-3 transition-colors ${
                  selectedIncident?.id === incident.id ? 'border-action bg-base' : 'border-border hover:border-action/50'
                }`}
              >
                <p className="text-sm text-text-primary font-medium">{incident.title}</p>
                <p className="text-xs text-text-muted">{incident.location}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-text-muted">{incident.category}</span>
                  <span className="text-xs px-2 py-1 rounded bg-urgency/20 text-urgency">
                    {Math.round(incident.priorityScore)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4 flex flex-col min-h-0">
          <h2 className="font-mono text-text-primary mb-3">
            Vertex AI Recommendations for: {selectedIncident?.title ?? 'No incident selected'}
          </h2>
          <div className="space-y-3 overflow-y-auto">
            {loadingRecommendations
              ? [1, 2, 3].map((item) => (
                  <div key={item} className="border border-border rounded p-3 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              : displayedRecommendations.map((volunteer) => (
                  <div key={'volunteerId' in volunteer ? volunteer.volunteerId : volunteer.id} className="border border-border rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-text-primary font-semibold">
                        {volunteer.name} ({volunteer.avatarInitials})
                      </p>
                      <span className="text-sm font-mono text-action">{volunteer.matchScore}%</span>
                    </div>
                    <div className="h-2 rounded bg-base overflow-hidden">
                      <div className="h-full bg-action" style={{ width: `${volunteer.matchScore}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {volunteer.skills.map((skill) => (
                        <SkillBadge key={skill} skill={skill} />
                      ))}
                    </div>
                    <p className="text-xs text-text-muted">
                      {volunteer.distance} km away · {('reliabilityScore' in volunteer ? volunteer.reliabilityScore : volunteer.reliability).toFixed(2)} reliability
                    </p>
                    <p className="text-xs text-text-primary">
                      {'reasoning' in volunteer
                        ? volunteer.reasoning
                        : `Prioritized due to ${volunteer.skills[0]} skill alignment, nearby distance, and proven reliability.`}
                    </p>
                    <button
                      className="w-full px-3 py-2 rounded bg-action text-white text-xs"
                      onClick={async () => {
                        if (!selectedIncident) return
                        const volunteerId = 'volunteerId' in volunteer ? volunteer.volunteerId : volunteer.id
                        await deployMutation.mutateAsync({ incidentId: selectedIncident.id, volunteerId })
                        emitGlobalToast({
                          type: 'volunteer_deployed',
                          title: 'Volunteer Deployed Successfully',
                          description: `${volunteer.name} assigned to ${selectedIncident.title}`,
                        })
                      }}
                    >
                      Deploy Volunteer
                    </button>
                  </div>
                ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg overflow-hidden min-h-0">
          {isLoaded && selectedIncident ? (
            <GoogleMap
              key={`matching-map-${theme}`}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: selectedIncident.coordinates.lat, lng: selectedIncident.coordinates.lng }}
              zoom={13}
              options={{ disableDefaultUI: true, styles: mapStyle }}
            >
              <MarkerF position={{ lat: selectedIncident.coordinates.lat, lng: selectedIncident.coordinates.lng }} />
              {displayedRecommendations.map((volunteer, idx) => (
                <MarkerF
                  key={'volunteerId' in volunteer ? volunteer.volunteerId : volunteer.id}
                  position={{
                    lat: selectedIncident.coordinates.lat + (idx + 1) * 0.003,
                    lng: selectedIncident.coordinates.lng - (idx + 1) * 0.003,
                  }}
                  onClick={() => setSelectedVolunteerPin('volunteerId' in volunteer ? volunteer.volunteerId : volunteer.id)}
                >
                  {selectedVolunteerPin === ('volunteerId' in volunteer ? volunteer.volunteerId : volunteer.id) && (
                    <InfoWindowF onCloseClick={() => setSelectedVolunteerPin(null)}>
                      <div className="text-xs">
                        <p>{volunteer.name}</p>
                        <p>Match Score: {volunteer.matchScore}%</p>
                      </div>
                    </InfoWindowF>
                  )}
                </MarkerF>
              ))}
            </GoogleMap>
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-base to-surface">
              <div className="text-center px-4">
                <div className="w-14 h-14 mx-auto mb-3 bg-skeleton rounded-lg animate-pulse" />
                <p className="text-sm text-text-muted">
                  Map unavailable. Add `VITE_GOOGLE_MAPS_API_KEY` or set `googleMapsApiKey` in localStorage.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
