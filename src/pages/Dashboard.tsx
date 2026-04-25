import { useActiveIncidents, useIncidentStats } from '@/hooks/useIncidents'
import { useVolunteers } from '@/hooks/useVolunteers'
import StatCard from '@/components/shared/StatCard'
import PrioritizedIssues from '@/components/shared/PrioritizedIssues'
import { GoogleMap, HeatmapLayerF, MarkerF, useJsApiLoader, InfoWindowF } from '@react-google-maps/api'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react'

const mapLibraries: ('visualization')[] = ['visualization']

const darkMapStyle = [
  { stylers: [{ saturation: -100 }, { lightness: -25 }] },
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'geometry.fill', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'all', elementType: 'geometry.fill', stylers: [{ color: '#0f172a' }] },
  { featureType: 'all', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#2d3748' }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ color: '#1e293b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#020617' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
]

// Helper to get marker icon based on incident category
const getCategoryIcon = (category: string, status: string, verified: boolean, geminiVerified: boolean) => {
  const isVerified = status === 'resolved' || (verified && geminiVerified)
  
  // Different shapes for different categories
  const pathMap: Record<string, number> = {
    'Flood': google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    'Earthquake': google.maps.SymbolPath.CIRCLE,
    'Fire': google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
    'Landslide': google.maps.SymbolPath.CIRCLE,
    'Medical Emergency': google.maps.SymbolPath.CIRCLE,
    'Infrastructure Damage': google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
  }

  const colorMap = {
    resolved: '#16A34A',
    verified: '#8B5CF6',
    pending: '#F59E0B',
    active: '#EF4444',
  }

  let color = colorMap.pending
  if (isVerified) color = colorMap.resolved
  else if (verified && geminiVerified) color = colorMap.verified
  else if (status === 'active') color = colorMap.active

  return {
    path: pathMap[category] || google.maps.SymbolPath.CIRCLE,
    scale: category === 'Fire' || category === 'Flood' ? 9 : 7,
    fillColor: color,
    fillOpacity: 0.9,
    strokeWeight: 2,
    strokeColor: '#F1F5F9',
    rotation: category === 'Flood' ? 90 : category === 'Fire' ? -45 : 0,
  }
}

export default function Dashboard() {
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  )
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [infoWindowPosition, setInfoWindowPosition] = useState<google.maps.LatLngLiteral | null>(null)
  const [legendOpen, setLegendOpen] = useState(false)
  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState<'all' | 'active' | 'inactive' | 'deployed'>('all')
  const [showVolunteerMarkers, setShowVolunteerMarkers] = useState(true)
  const { data: incidents } = useActiveIncidents()
  const { data: stats, isLoading: statsLoading } = useIncidentStats()
  const { data: volunteersData } = useVolunteers(undefined, undefined, undefined, undefined, 1, 200)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? localStorage.getItem('googleMapsApiKey') ?? ''
  const { isLoaded } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: apiKey,
    libraries: mapLibraries,
  })

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

  // Calculate map center and generate random offsets for volunteers
  const mapCenter = useMemo(() => {
    if (incidents && incidents.length > 0) {
      const avgLat = incidents.reduce((sum, inc) => sum + inc.coordinates.lat, 0) / incidents.length
      const avgLng = incidents.reduce((sum, inc) => sum + inc.coordinates.lng, 0) / incidents.length
      return { lat: avgLat, lng: avgLng }
    }
    return { lat: 21.2514, lng: 81.6296 } // Default to Raipur
  }, [incidents])

  const filteredVolunteers = useMemo(() => {
    const all = volunteersData?.items ?? []
    if (volunteerStatusFilter === 'all') return all
    return all.filter((v: any) => v.status === volunteerStatusFilter)
  }, [volunteersData, volunteerStatusFilter])

  const volunteerPositions = useMemo(() => {
    return filteredVolunteers
      .map((volunteer: any) => {
        const coords = volunteer.currentCoordinates ?? volunteer.homeCoordinates
        if (!coords) return null

        return {
          id: volunteer.id,
          name: volunteer.name,
          status: volunteer.status,
          skills: volunteer.skills,
          position: {
            lat: coords.lat,
            lng: coords.lng,
          },
        }
      })
      .filter(Boolean) as Array<{
      id: string
      name: string
      status: 'active' | 'inactive' | 'deployed'
      skills: string[]
      position: { lat: number; lng: number }
    }>
  }, [filteredVolunteers])

  // Handle incident marker click
  const handleIncidentClick = useCallback((incident: any) => {
    setSelectedIncident(incident)
    setInfoWindowPosition({ lat: incident.coordinates.lat, lng: incident.coordinates.lng })
  }, [])

  // Calculate stats for legend
  const incidentStats = useMemo(() => {
    if (!incidents) return { total: 0, critical: 0, active: 0, resolved: 0 }
    return {
      total: incidents.length,
      critical: incidents.filter(i => i.urgencyScore >= 70).length,
      active: incidents.filter(i => i.status === 'active' || i.status === 'pending').length,
      resolved: incidents.filter(i => i.status === 'resolved').length,
    }
  }, [incidents])

  return (
    <div className="space-y-6 h-full">
      <h1 className="text-3xl font-mono font-semibold text-text-primary">Command Center</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Active Fieldworkers"
          value={stats?.activeFieldworkers ?? 0}
          isLoading={statsLoading}
        />
        <StatCard
          label="Pending Digitization Queue"
          value={stats?.pendingDigitization ?? 0}
          isLoading={statsLoading}
        />
        <StatCard
          label="High-Urgency Tasks"
          value={stats?.highUrgencyTasks ?? 0}
          isLoading={statsLoading}
        />
        <StatCard
          label="Average Response Time"
          value={stats ? `${stats.avgResponseTime}m` : 0}
          isLoading={statsLoading}
        />
      </div>

      <div className="bg-surface border border-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-4">
        <label className="text-xs text-text-muted flex items-center gap-2">
          Volunteer view
          <select
            value={volunteerStatusFilter}
            onChange={(e) =>
              setVolunteerStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'deployed')
            }
            className="bg-base border border-border rounded px-2 py-1 text-xs text-text-primary"
          >
            <option value="all">All volunteers</option>
            <option value="active">Active volunteers</option>
            <option value="inactive">Inactive volunteers</option>
            <option value="deployed">Deployed volunteers</option>
          </select>
        </label>

        <label className="text-xs text-text-muted flex items-center gap-2">
          <input
            type="checkbox"
            checked={showVolunteerMarkers}
            onChange={(e) => setShowVolunteerMarkers(e.target.checked)}
          />
          Show volunteer markers
        </label>

      </div>

      {/* 3 Panels in Single Row: Map | Volunteers | Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel 1: Map - Perfect Square */}
        <div className="lg:col-span-6 bg-surface border border-border rounded-lg overflow-hidden relative" style={{ height: '680px' }}>
          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-10 bg-surface/90 backdrop-blur-sm border border-border rounded-lg shadow-lg max-w-[190px]">
            <button
              type="button"
              onClick={() => setLegendOpen((v) => !v)}
              className="w-full px-2 py-1.5 flex items-center justify-between gap-2"
              title={legendOpen ? 'Collapse legend' : 'Expand legend'}
            >
              <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Legend
              </span>
              {legendOpen ? (
                <ChevronUp className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              )}
            </button>

            {!legendOpen ? (
              <div className="px-2 pb-2">
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-base border border-border">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Active
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-base border border-border">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Pending
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-base border border-border">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    AI
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-base border border-border">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    Resolved
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-2 pb-2 max-h-[220px] overflow-auto">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-text-muted">Active/Pending (High Urgency)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                    <span className="text-text-muted">Pending Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-text-muted">AI Verified (Gemini)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-text-muted">Resolved</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <div className="w-4 h-4 text-blue-500">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      </svg>
                    </div>
                    <span className="text-text-muted">Active Volunteer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded"></div>
                    <span className="text-text-muted">Heatmap Intensity</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Total Incidents:</span>
                    <span className="font-semibold text-text-primary">{incidentStats.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Critical (70+):</span>
                    <span className="font-semibold text-red-500">{incidentStats.critical}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Active:</span>
                    <span className="font-semibold text-amber-500">{incidentStats.active}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Resolved:</span>
                    <span className="font-semibold text-green-500">{incidentStats.resolved}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isLoaded && incidents ? (
            <GoogleMap
              key={`map-${theme}`}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={9}
              options={{
                styles: mapStyle,
                zoomControl: true,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
                mapTypeId: 'roadmap',
                gestureHandling: 'greedy',
              }}
            >
              <HeatmapLayerF
                data={incidents.map((incident) => ({
                  location: new google.maps.LatLng(incident.coordinates.lat, incident.coordinates.lng),
                  weight: incident.urgencyScore,
                }))}
                options={{
                  radius: 30,
                  opacity: 0.6,
                }}
              />
              {incidents.map((incident, index) => (
                <MarkerF
                  key={`incident-marker-${incident.id ?? incident.title ?? 'unknown'}-${index}`}
                  position={{ lat: incident.coordinates.lat, lng: incident.coordinates.lng }}
                  animation={
                    incident.status === 'active' && !incident.verified ? google.maps.Animation.BOUNCE : undefined
                  }
                  icon={getCategoryIcon(incident.category, incident.status, incident.verified, incident.geminiVerified)}
                  title={`${incident.title} (${incident.category})`}
                  onClick={() => handleIncidentClick(incident)}
                />
              ))}

              {/* Info Window for Selected Incident */}
              {selectedIncident && infoWindowPosition && (
                <InfoWindowF
                  position={infoWindowPosition}
                  onCloseClick={() => {
                    setSelectedIncident(null)
                    setInfoWindowPosition(null)
                  }}
                >
                  <div className="p-2 max-w-xs">
                    <h3 className="font-bold text-sm text-gray-900 mb-2">{selectedIncident.title}</h3>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p><strong>Category:</strong> {selectedIncident.category}</p>
                      <p><strong>Location:</strong> {selectedIncident.location}</p>
                      <p><strong>Urgency:</strong> <span className={`font-semibold ${selectedIncident.urgencyScore >= 70 ? 'text-red-600' : 'text-amber-600'}`}>{selectedIncident.urgencyScore}%</span></p>
                      <p><strong>Status:</strong> <span className="capitalize">{selectedIncident.status}</span></p>
                      <p><strong>Severity:</strong> {selectedIncident.severity}/10</p>
                      <p><strong>Affected:</strong> {selectedIncident.affectedCount} people</p>
                      {selectedIncident.reporterName && (
                        <p><strong>Reporter:</strong> {selectedIncident.reporterName}</p>
                      )}
                      {selectedIncident.verified && (
                        <p className="text-green-600 font-semibold">✓ Field Verified</p>
                      )}
                      {selectedIncident.geminiVerified && (
                        <p className="text-purple-600 font-semibold">✓ AI Verified (Gemini)</p>
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600"><strong>Description:</strong></p>
                      <p className="text-xs text-gray-700 mt-1">{selectedIncident.description}</p>
                    </div>
                  </div>
                </InfoWindowF>
              )}
              {showVolunteerMarkers &&
                volunteerPositions.map((vol: any, index: number) => (
                  <MarkerF
                    key={`volunteer-marker-${vol.id ?? vol.name ?? 'unknown'}-${index}`}
                    position={vol.position}
                    icon={{
                      // Use same volunteer icon style as Matching Engine.
                      path: 'M12 2a4 4 0 1 1 0 8a4 4 0 0 1 0-8zm0 10c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6z',
                      scale: 1.1,
                      fillColor:
                        vol.status === 'deployed' ? '#8B5CF6' : vol.status === 'inactive' ? '#64748B' : '#3B82F6',
                      fillOpacity: 1,
                      strokeWeight: 1.5,
                      strokeColor: '#F1F5F9',
                    }}
                    title={`${vol.name || 'Volunteer'} (${vol.status}) - Skills: ${(vol.skills || []).slice(0, 3).join(', ')}`}
                  />
                ))}
            </GoogleMap>
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-base to-surface">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-skeleton rounded-lg animate-pulse" />
                <p className="text-text-muted text-sm mb-2">Map View</p>
                <p className="text-xs text-text-muted max-w-xs">
                  Add your Google Maps API key to localStorage as `googleMapsApiKey` to enable live heatmap rendering.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Active Volunteers */}
        <div className="lg:col-span-3 bg-surface border border-border rounded-lg overflow-hidden flex flex-col" style={{ height: '680px' }}>
          <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <h2 className="text-sm font-semibold text-text-primary">
              {volunteerStatusFilter === 'all'
                ? 'All Volunteers'
                : `${volunteerStatusFilter[0].toUpperCase()}${volunteerStatusFilter.slice(1)} Volunteers`}
            </h2>
            <p className="text-xs text-text-muted mt-1">
              {filteredVolunteers.length} shown
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredVolunteers
              .slice(0, 20)
              .map((volunteer: any) => (
                <div key={volunteer.id} className="p-3 bg-base/50 rounded-lg border border-border hover:border-blue-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {volunteer.avatarInitials || volunteer.name?.split(' ').map((n: string) => n[0]).join('') || 'V'}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">{volunteer.name}</h4>
                        <p className="text-xs text-text-muted">{volunteer.email}</p>
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        volunteer.status === 'deployed'
                          ? 'bg-purple-500'
                          : volunteer.status === 'inactive'
                            ? 'bg-slate-500'
                            : 'bg-green-500'
                      }`}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(volunteer.skills || []).slice(0, 3).map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  {volunteer.currentCoordinates && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
                      <MapPin className="w-3 h-3" />
                      <span>{volunteer.currentCoordinates.lat.toFixed(4)}, {volunteer.currentCoordinates.lng.toFixed(4)}</span>
                    </div>
                  )}
                  <div className="mt-2 text-[11px] uppercase tracking-wide text-text-muted">
                    Status: {volunteer.status}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Panel 3: Live Incident Feed */}
        <div className="lg:col-span-3 bg-surface border border-border rounded-lg overflow-hidden flex flex-col" style={{ height: '680px' }}>
            <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-red-500/10 to-orange-500/10">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Live Incident Feed
                </h2>
                <span className="text-xs text-text-muted">
                  {incidents?.length ?? 0} incidents
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {incidents && incidents.length > 0 ? (
                incidents.slice(0, 6).map((incident: any) => (
                  <div
                    key={incident.id}
                    onClick={() => handleIncidentClick(incident)}
                    className="p-3 bg-base/50 rounded-lg border border-border hover:border-blue-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-text-primary group-hover:text-blue-500 transition-colors line-clamp-1">
                        {incident.title}
                      </h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        incident.urgencyScore >= 70 ? 'bg-red-500/20 text-red-500' :
                        incident.urgencyScore >= 40 ? 'bg-amber-500/20 text-amber-500' :
                        'bg-green-500/20 text-green-500'
                      }`}>
                        {incident.urgencyScore}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                      <span className="capitalize">{incident.category}</span>
                      <span>•</span>
                      <span className="capitalize">{incident.status}</span>
                      <span>•</span>
                      <span>{incident.affectedCount} affected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">{incident.location}</span>
                      <div className="flex items-center gap-1">
                        {incident.verified && (
                          <span className="text-green-500" title="Field Verified">✓</span>
                        )}
                        {incident.geminiVerified && (
                          <span className="text-purple-500" title="AI Verified">🤖</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-text-muted text-sm">
                  No active incidents
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Prioritized Issues — Data Digitization Pipeline Output */}
      <div className="mt-2">
        <PrioritizedIssues />
      </div>
    </div>
  )
}
