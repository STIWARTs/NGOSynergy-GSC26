import { useEffect, useMemo, useState, useRef } from 'react'
import { useAIWeights } from '@/context/AIWeightsContext'
import { CircleF, GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import { Skeleton } from '@/components/shared/Skeleton'
import { emitGlobalToast } from '@/lib/events'
import { useDeployMatch, useMatchResults } from '@/hooks/useMatching'
import SkillBadge from '@/components/shared/SkillBadge'
import { useActiveIncidents } from '@/hooks/useIncidents'
import { useVolunteers } from '@/hooks/useVolunteers'

const mapLibraries: ('visualization')[] = ['visualization']

const darkMapStyle = [
  { stylers: [{ saturation: -100 }, { lightness: -25 }] },
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
]

const volunteerHomeIcon = {
  path: 'M12 2a4 4 0 1 1 0 8a4 4 0 0 1 0-8zm0 10c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6z',
  scale: 1.1,
  fillColor: '#3B82F6',
  fillOpacity: 1,
  strokeColor: '#F8FAFC',
  strokeWeight: 1.5,
}

const incidentAlertIcon = {
  path: 'M12 2L2 20h20L12 2zm0 5.5c.55 0 1 .45 1 1V13a1 1 0 1 1-2 0V8.5c0-.55.45-1 1-1zm0 9.5a1.25 1.25 0 1 1 0-2.5a1.25 1.25 0 0 1 0 2.5z',
  scale: 1.3,
  fillColor: '#EF4444',
  fillOpacity: 0.95,
  strokeColor: '#F8FAFC',
  strokeWeight: 1.5,
}

const MultiSelectDropdown = ({ title, options, selected, onChange }: { title: string, options: {label: string, value: string}[], selected: string[], onChange: (val: string[]) => void }) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter(s => s !== opt))
    else onChange([...selected, opt])
  }

  return (
    <div className="relative inline-block text-left w-full" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="w-full bg-base border border-border rounded px-3 py-2 text-sm text-text-primary flex justify-between items-center">
        <span className="truncate">{selected.length === 0 ? title : `${title} (${selected.length})`}</span>
        <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-[100] mt-1 w-full bg-base border border-border rounded shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 space-y-1">
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-text-primary p-1 hover:bg-surface rounded cursor-pointer">
                <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => toggle(opt.value)} className="rounded" />
                <span className="truncate">{opt.label}</span>
              </label>
            ))}
            {options.length === 0 && <div className="text-xs text-text-muted p-1">No options</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MatchingEngine() {
  const [incidentId, setIncidentId] = useState('')
  const [radiusIncidentId, setRadiusIncidentId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [urgencyFilter, setUrgencyFilter] = useState<string[]>([])
  const [zoneFilter, setZoneFilter] = useState<string[]>([])
  const [radiusKm, setRadiusKm] = useState(30)
  const [topN, setTopN] = useState(10)
  const [showAllVolunteersOnMap, setShowAllVolunteersOnMap] = useState(true)
  const [showAllCrisesOnMap, setShowAllCrisesOnMap] = useState(true)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [selectedVolunteerPin, setSelectedVolunteerPin] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  )
  const [volunteerSkillFilter, setVolunteerSkillFilter] = useState<string[]>([])
  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState<string[]>([])
  const { weights } = useAIWeights()
  const { data: incidents = [], isLoading: incidentsLoading } = useActiveIncidents()
  const { data: volunteersData } = useVolunteers(undefined, undefined, undefined, undefined, 1, 200)
  const volunteers = volunteersData?.items ?? []
  
  const allSkills = useMemo(() => {
    const skills = new Set<string>()
    volunteers.forEach((v) => v.skills.forEach((s) => skills.add(s)))
    return Array.from(skills).sort()
  }, [volunteers])

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? localStorage.getItem('googleMapsApiKey') ?? ''
  const { isLoaded } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: apiKey,
    libraries: mapLibraries,
  })

  const now = Date.now()
  const highPriorityIncidents = useMemo(() => {
    return incidents
      // Show all ongoing incidents in queue/map. Do not hide pending items.
      .filter((incident) => incident.status !== 'resolved')
      .map((incident) => {
        const ageHours = (now - new Date(incident.timestamp).getTime()) / (1000 * 60 * 60)
        const timeFactor = Math.min(12, Math.max(1, ageHours))
        const impact = Number(incident.impact ?? 1)
        const severity = Number(incident.severity ?? 1)
        const normalizedImpact = Number.isFinite(impact) ? impact : 1
        const normalizedSeverity = Number.isFinite(severity) ? severity : 1
        const priorityScore = normalizedImpact * normalizedSeverity * 10 + timeFactor
        return { ...incident, priorityScore }
      })
      .filter((incident) => (categoryFilter.length === 0 ? true : categoryFilter.includes(incident.category)))
      .filter((incident) =>
        urgencyFilter.length === 0
          ? true
          : urgencyFilter.some((u) =>
              u === 'critical'
                ? incident.priorityScore >= 70
                : u === 'high'
                  ? incident.priorityScore >= 50 && incident.priorityScore < 70
                  : incident.priorityScore < 50
            )
      )
      .filter((incident) =>
        zoneFilter.length === 0
          ? true
          : zoneFilter.some((z) => incident.location.toLowerCase().includes(z.toLowerCase()))
      )
      .sort((a, b) => b.priorityScore - a.priorityScore)
  }, [categoryFilter, incidents, now, urgencyFilter, zoneFilter])

  const selectedIncident = useMemo(
    () => highPriorityIncidents.find((incident) => incident.id === incidentId) ?? null,
    [highPriorityIncidents, incidentId]
  )
  const { data: suggestedMatches = [] } = useMatchResults(selectedIncident?.id ?? '', weights, { radiusKm, limit: topN })
  const deployMutation = useDeployMatch()

  const rankedVolunteers = useMemo(() => {
    if (!selectedIncident) {
      return volunteers
        .map((volunteer) => ({
          ...volunteer,
          matchScore: Math.round((volunteer.reliabilityScore ?? 0) * 100),
          distance: volunteer.distance ?? 0,
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
    }

    return volunteers
      .map((volunteer) => {
        const skillScore = volunteer.skills.some((skill) =>
          selectedIncident.category.toLowerCase().includes(skill.toLowerCase())
        )
          ? 1
          : 0.4

        // Calculate actual distance from incident coordinates
        const coords = volunteer.homeCoordinates ?? volunteer.currentCoordinates
        let calculatedDistance = volunteer.distance ?? 0
        if (coords && selectedIncident.coordinates) {
          const R = 6371 // Earth's radius in km
          const dLat = ((coords.lat - selectedIncident.coordinates.lat) * Math.PI) / 180
          const dLng = ((coords.lng - selectedIncident.coordinates.lng) * Math.PI) / 180
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((selectedIncident.coordinates.lat * Math.PI) / 180) *
              Math.cos((coords.lat * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          calculatedDistance = R * c
        }

        const proximityScore = Math.max(0, 1 - calculatedDistance / 30) // Normalize by 30km
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
          distance: calculatedDistance,
        }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [selectedIncident, volunteers, weights])

  useEffect(() => {
    if (!radiusIncidentId) return
    const stillExists = highPriorityIncidents.some((incident) => incident.id === radiusIncidentId)
    if (!stillExists) {
      setRadiusIncidentId(null)
    }
  }, [highPriorityIncidents, radiusIncidentId])

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

  const radiusIncident = useMemo(() => {
    if (!radiusIncidentId) return null
    return highPriorityIncidents.find((incident) => incident.id === radiusIncidentId) ?? null
  }, [highPriorityIncidents, radiusIncidentId])

  const displayedRecommendations = selectedIncident
    ? rankedVolunteers.filter((volunteer) => {
        // Filter by manual filters (skill & status)
        const matchSkill = volunteerSkillFilter.length === 0 ? true : volunteerSkillFilter.some(s => volunteer.skills.includes(s))
        const matchStatus = volunteerStatusFilter.length === 0 ? true : volunteerStatusFilter.includes(volunteer.status)
        
        // Only filter by radius when radiusIncident is explicitly set (user clicked on incident for radius filtering)
        if (!radiusIncident) return matchSkill && matchStatus
        
        const coords = volunteer.homeCoordinates ?? volunteer.currentCoordinates
        if (!coords) return false
        
        const R = 6371 // Earth's radius in km
        const dLat = ((coords.lat - radiusIncident.coordinates.lat) * Math.PI) / 180
        const dLng = ((coords.lng - radiusIncident.coordinates.lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((radiusIncident.coordinates.lat * Math.PI) / 180) *
            Math.cos((coords.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c
        
        return matchSkill && matchStatus && distance <= radiusKm
      })
    : rankedVolunteers.filter((volunteer) => {
        // When no incident selected, only apply skill/status filters
        const matchSkill = volunteerSkillFilter.length === 0 ? true : volunteerSkillFilter.some(s => volunteer.skills.includes(s))
        const matchStatus = volunteerStatusFilter.length === 0 ? true : volunteerStatusFilter.includes(volunteer.status)
        return matchSkill && matchStatus
      })
  const displayedRecommendationsWithCoords = useMemo(
    () =>
      displayedRecommendations
        .map((volunteer) => {
          const volunteerId = volunteer.id
          return {
            ...volunteer,
            homeCoordinates: volunteer.homeCoordinates ?? volunteer.currentCoordinates,
            status: volunteer.status,
            fullSkills: volunteer.skills,
          }
        })
        .filter((v) => {
          const matchSkill = volunteerSkillFilter.length === 0 ? true : volunteerSkillFilter.some(s => v.fullSkills.includes(s))
          const matchStatus = volunteerStatusFilter.length === 0 ? true : volunteerStatusFilter.includes(v.status || '')
          return matchSkill && matchStatus
        }),
    [displayedRecommendations, volunteerSkillFilter, volunteerStatusFilter]
  )

  const allVolunteerPins = useMemo(() => {
    return volunteers
      .filter((v) => {
        const matchSkill = volunteerSkillFilter.length === 0 ? true : volunteerSkillFilter.some(s => v.skills.includes(s))
        const matchStatus = volunteerStatusFilter.length === 0 ? true : volunteerStatusFilter.includes(v.status)
        return matchSkill && matchStatus
      })
      .map((v) => ({
        ...v,
        pinCoordinates: v.homeCoordinates ?? v.currentCoordinates,
      }))
      .filter((v) => !!v.pinCoordinates)
  }, [volunteers, volunteerSkillFilter, volunteerStatusFilter])

  const recommendedIds = useMemo(() => {
    return new Set(displayedRecommendationsWithCoords.map((v) => v.id))
  }, [displayedRecommendationsWithCoords])

  const volunteerPinsToShow = showAllVolunteersOnMap
    ? allVolunteerPins
    : allVolunteerPins.filter((v) => recommendedIds.has(v.id))

  const mapCenter = useMemo(() => {
    // When user selects a crisis, always focus map on that crisis.
    if (selectedIncident) {
      return { lat: selectedIncident.coordinates.lat, lng: selectedIncident.coordinates.lng }
    }
    if (showAllCrisesOnMap && highPriorityIncidents.length > 0) {
      const avgLat =
        highPriorityIncidents.reduce((sum, incident) => sum + incident.coordinates.lat, 0) /
        highPriorityIncidents.length
      const avgLng =
        highPriorityIncidents.reduce((sum, incident) => sum + incident.coordinates.lng, 0) /
        highPriorityIncidents.length
      return { lat: avgLat, lng: avgLng }
    }
    return { lat: 21.2514, lng: 81.6296 }
  }, [highPriorityIncidents, selectedIncident, showAllCrisesOnMap])

  const mapZoom = selectedIncident ? 11 : showAllCrisesOnMap && highPriorityIncidents.length > 1 ? 6 : 13

  return (
    <div className="space-y-4 h-full">
      <h1 className="text-3xl font-mono font-semibold text-text-primary">Matching Engine</h1>

      <div className="bg-surface border border-border rounded-lg p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <MultiSelectDropdown
          title="All incident categories"
          options={[...new Set(incidents.map((incident) => incident.category))].map((c) => ({ label: c, value: c }))}
          selected={categoryFilter}
          onChange={setCategoryFilter}
        />
        <MultiSelectDropdown
          title="All incident urgency"
          options={[
            { label: 'Critical', value: 'critical' },
            { label: 'High', value: 'high' },
            { label: 'Medium', value: 'medium' },
          ]}
          selected={urgencyFilter}
          onChange={setUrgencyFilter}
        />
        <MultiSelectDropdown
          title="All incident zones"
          options={[
            { label: 'Downtown', value: 'downtown' },
            { label: 'Industrial', value: 'industrial' },
            { label: 'North', value: 'north' },
            { label: 'Coordination Zones', value: 'zone' },
          ]}
          selected={zoneFilter}
          onChange={setZoneFilter}
        />
        <div className="text-xs text-text-muted flex items-center px-2 justify-end gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAllCrisesOnMap}
              onChange={(e) => setShowAllCrisesOnMap(e.target.checked)}
            />
            Show all crises on map
          </label>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <MultiSelectDropdown
          title="All volunteer skills"
          options={allSkills.map((s) => ({ label: s, value: s }))}
          selected={volunteerSkillFilter}
          onChange={setVolunteerSkillFilter}
        />
        <MultiSelectDropdown
          title="All volunteer status"
          options={[
            { label: 'Active (Available)', value: 'active' },
            { label: 'Deployed', value: 'deployed' },
            { label: 'Inactive', value: 'inactive' },
          ]}
          selected={volunteerStatusFilter}
          onChange={setVolunteerStatusFilter}
        />
        <div className="md:col-span-2 text-xs text-text-muted flex items-center px-2 justify-end gap-3 flex-wrap">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAllVolunteersOnMap}
              onChange={(e) => setShowAllVolunteersOnMap(e.target.checked)}
            />
            Show all volunteers
          </label>
          <label className={`flex items-center gap-2 ${!selectedIncident && !radiusIncidentId ? 'opacity-50' : ''}`} title={!selectedIncident && !radiusIncidentId ? "Select an incident to enable radius filter" : ""}>
            <input
              type="checkbox"
              disabled={!selectedIncident && !radiusIncidentId}
              checked={!!radiusIncidentId}
              onChange={(e) => {
                if (e.target.checked && selectedIncident) {
                  setRadiusIncidentId(selectedIncident.id)
                } else {
                  setRadiusIncidentId(null)
                }
              }}
            />
            Enable radius filter
          </label>
          <div className="flex items-center gap-2">
            <span>Radius</span>
            <input
              type="range"
              min={0.5}
              max={100}
              step={0.5}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            />
            <span className="w-14 text-right">{radiusKm < 1 ? `${radiusKm * 1000}m` : `${radiusKm}km`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Top</span>
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="bg-base border border-border rounded px-2 py-1 text-xs text-text-primary"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[68vh]">
        <div className="bg-surface border border-border rounded-lg p-4 flex flex-col min-h-0">
          <h2 className="font-mono text-text-primary mb-3">Verified High-Priority Queue</h2>
          <div className="space-y-2 overflow-y-auto">
            {highPriorityIncidents.map((incident) => (
              <button
                key={incident.id}
                onClick={() => {
                  const nextIncidentId = incidentId === incident.id ? '' : incident.id
                  setIncidentId(nextIncidentId)
                  if (radiusIncidentId) setRadiusIncidentId(nextIncidentId ? nextIncidentId : null)
                }}
                className={`w-full text-left border rounded p-3 transition-colors ${
                  selectedIncident?.id === incident.id ? 'border-action bg-base' : 'border-border hover:border-action/50'
                }`}
              >
                <p className="text-sm text-text-primary font-medium">{incident.title}</p>
                <p className="text-xs text-text-muted">{incident.location}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-text-muted">{incident.category}</span>
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded ${
                      incident.priorityScore >= 70 ? 'bg-red-500/20' : incident.priorityScore >= 50 ? 'bg-orange-500/20' : 'bg-amber-500/20'
                    }`}
                    title={incident.priorityScore >= 70 ? 'Critical (Red)' : incident.priorityScore >= 50 ? 'High (Orange)' : 'Medium (Yellow)'}
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill={incident.priorityScore >= 70 ? '#EF4444' : incident.priorityScore >= 50 ? '#F97316' : '#F59E0B'}>
                      <path d="M12 2L2 20h20L12 2zm0 5.5c.55 0 1 .45 1 1V13a1 1 0 1 1-2 0V8.5c0-.55.45-1 1-1zm0 9.5a1.25 1.25 0 1 1 0-2.5a1.25 1.25 0 0 1 0 2.5z" />
                    </svg>
                  </span>
                </div>
              </button>
            ))}
            {!incidentsLoading && highPriorityIncidents.length === 0 && (
              <p className="text-xs text-text-muted">No verified incidents available for matching.</p>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4 flex flex-col min-h-0">
          <h2 className="font-mono text-text-primary mb-3">
            ML Recommendations for: {selectedIncident?.title ?? 'No incident selected'}
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
              : displayedRecommendationsWithCoords.length > 0 ? displayedRecommendationsWithCoords.map((volunteer) => (
                  <div key={volunteer.id} className="border border-border rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-text-primary font-semibold">
                        {volunteer.name} ({volunteer.avatarInitials ?? volunteer.name.slice(0, 2).toUpperCase()})
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
                      {volunteer.distance} km away · {volunteer.reliabilityScore.toFixed(2)} reliability
                    </p>
                    <p className="text-xs text-text-primary">
                      {selectedIncident
                        ? `Prioritized due to ${volunteer.skills[0]} skill alignment, nearby distance, and proven reliability.`
                        : 'Showing volunteer availability overview. Select a crisis to see incident-specific ML ranking.'}
                    </p>
                    <button
                      className="w-full px-3 py-2 rounded bg-action text-white text-xs"
                      onClick={async () => {
                        if (!selectedIncident) return
                        const volunteerId = volunteer.id
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
                )) : (
                  <div className="border border-border rounded p-4 text-sm text-text-muted">
                    {selectedIncident 
                      ? 'No volunteers found within the specified radius or criteria. Try increasing the radius.' 
                      : 'Select an incident to see volunteers ranked by the trained ML matching pipeline.'}
                  </div>
                )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg overflow-hidden min-h-0">
          {isLoaded ? (
            <GoogleMap
              key={`matching-map-${theme}`}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={mapZoom}
              options={{ disableDefaultUI: true, styles: mapStyle }}
            >
              {radiusIncident ? (
                <CircleF
                  center={{ lat: radiusIncident.coordinates.lat, lng: radiusIncident.coordinates.lng }}
                  radius={radiusKm * 1000}
                  options={{
                    fillColor: '#3B82F6',
                    fillOpacity: 0.12,
                    strokeColor: '#60A5FA',
                    strokeOpacity: 0.9,
                    strokeWeight: 2,
                    clickable: false,
                  }}
                />
              ) : null}
              {showAllCrisesOnMap
                ? highPriorityIncidents.map((incident) => {
                    const isSelected = selectedIncident?.id === incident.id
                    const isCritical = incident.priorityScore >= 70
                    const isHigh = incident.priorityScore >= 50 && incident.priorityScore < 70
                    return (
                      <MarkerF
                        key={`crisis-${incident.id}`}
                        position={{ lat: incident.coordinates.lat, lng: incident.coordinates.lng }}
                        icon={{
                          ...incidentAlertIcon,
                          fillColor: isCritical ? '#EF4444' : isHigh ? '#F97316' : '#F59E0B',
                          fillOpacity: isSelected ? 0.98 : 0.85,
                          scale: isSelected ? 1.3 : 1.1,
                          anchor: new google.maps.Point(12, 20),
                        }}
                        title={`${incident.title} (${incident.location})`}
                        onClick={() => {
                          const nextIncidentId = incidentId === incident.id ? '' : incident.id
                          setIncidentId(nextIncidentId)
                          if (radiusIncidentId) setRadiusIncidentId(nextIncidentId ? nextIncidentId : null)
                        }}
                      />
                    )
                  })
                : selectedIncident && (
                    <MarkerF
                      key={`crisis-selected-${selectedIncident.id}`}
                      position={{ lat: selectedIncident.coordinates.lat, lng: selectedIncident.coordinates.lng }}
                      icon={{
                        ...incidentAlertIcon,
                        fillColor: selectedIncident.priorityScore >= 70 ? '#EF4444' : selectedIncident.priorityScore >= 50 ? '#F97316' : '#F59E0B',
                        fillOpacity: 0.98,
                        scale: 1.3,
                        anchor: new google.maps.Point(12, 20),
                      }}
                      title={`${selectedIncident.title} (${selectedIncident.location})`}
                      onClick={() => {
                        const nextIncidentId = incidentId === selectedIncident.id ? '' : selectedIncident.id
                        setIncidentId(nextIncidentId)
                        if (radiusIncidentId) setRadiusIncidentId(nextIncidentId ? nextIncidentId : null)
                      }}
                    />
                  )}
              {volunteerPinsToShow.map((volunteer) => (
                <MarkerF
                  key={`vol-${volunteer.id}`}
                  position={{
                    lat: (volunteer.pinCoordinates as any).lat,
                    lng: (volunteer.pinCoordinates as any).lng,
                  }}
                  icon={volunteerHomeIcon}
                  title={`${volunteer.name} (Home/Base)`}
                  onClick={() => setSelectedVolunteerPin(volunteer.id)}
                >
                  {selectedVolunteerPin === volunteer.id && (
                    <InfoWindowF onCloseClick={() => setSelectedVolunteerPin(null)}>
                      <div className="text-xs">
                        <p>{volunteer.name}</p>
                        <p className="text-[11px] text-gray-600">Home/Base Location</p>
                        <p>{recommendedIds.has(volunteer.id) ? 'Recommended' : 'Volunteer'}</p>
                      </div>
                    </InfoWindowF>
                  )}
                </MarkerF>
              ))}
            </GoogleMap>
          ) : selectedIncident ? (
            <div className="h-full flex flex-col bg-gradient-to-br from-base to-surface p-4">
              <div className="border border-border rounded-lg p-4 bg-surface/70">
                <h3 className="text-sm font-semibold text-text-primary mb-2">{selectedIncident.title}</h3>
                <p className="text-xs text-text-muted mb-3">
                  Incident at {selectedIncident.location} ({selectedIncident.coordinates.lat.toFixed(4)},{' '}
                  {selectedIncident.coordinates.lng.toFixed(4)})
                </p>
                <div className="space-y-2">
                  {displayedRecommendationsWithCoords.slice(0, 5).map((volunteer) => (
                    <div
                      key={`fallback-${volunteer.id}`}
                      className="rounded border border-border px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary font-medium">{volunteer.name}</span>
                        <span className="text-action">{volunteer.matchScore}%</span>
                      </div>
                      <div className="text-text-muted mt-1">
                        {'currentCoordinates' in volunteer && volunteer.currentCoordinates
                          ? `${volunteer.currentCoordinates.lat.toFixed(4)}, ${volunteer.currentCoordinates.lng.toFixed(4)}`
                          : 'Coordinates unavailable'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-text-muted mt-4 text-center">
                Add `VITE_GOOGLE_MAPS_API_KEY` or set `googleMapsApiKey` in localStorage to enable route map visualization.
              </p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-base to-surface">
              <div className="text-center px-4">
                <div className="w-14 h-14 mx-auto mb-3 bg-skeleton rounded-lg animate-pulse" />
                <p className="text-sm text-text-muted">
                  Select an incident from the queue to run ML-based volunteer matching.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
