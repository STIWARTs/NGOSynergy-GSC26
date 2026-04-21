import { useActiveIncidents, useIncidentStats } from '@/hooks/useIncidents'
import StatCard from '@/components/shared/StatCard'
import IncidentFeedItem from '@/components/shared/IncidentFeedItem'
import { Skeleton } from '@/components/shared/Skeleton'
import { GoogleMap, HeatmapLayerF, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import { mockVolunteers } from '@/lib/mockData'

const mapLibraries: ('visualization')[] = ['visualization']
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
]

export default function Dashboard() {
  const { data: incidents, isLoading: incidentsLoading } = useActiveIncidents()
  const { data: stats, isLoading: statsLoading } = useIncidentStats()
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? localStorage.getItem('googleMapsApiKey') ?? ''
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: mapLibraries,
  })

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

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 bg-surface border border-border rounded-lg overflow-hidden">
          {isLoaded && incidents ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: incidents[0]?.latitude ?? 40.7128, lng: incidents[0]?.longitude ?? -74.006 }}
              zoom={12}
              options={{ styles: mapStyle, disableDefaultUI: true }}
            >
              <HeatmapLayerF
                data={incidents.map((incident) => ({
                  location: new google.maps.LatLng(incident.latitude, incident.longitude),
                  weight: incident.severity * incident.impact,
                }))}
              />
              {incidents.map((incident) => (
                <MarkerF
                  key={incident.id}
                  position={{ lat: incident.latitude, lng: incident.longitude }}
                  animation={
                    incident.status === 'active' && !incident.verified ? google.maps.Animation.BOUNCE : undefined
                  }
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor:
                      incident.status === 'resolved' || (incident.verified && incident.vertexVerified)
                        ? '#16A34A'
                        : incident.status === 'active'
                          ? '#DC2626'
                          : '#2563EB',
                    fillOpacity: 1,
                    strokeWeight: 1,
                    strokeColor: '#F1F5F9',
                  }}
                />
              ))}
              {mockVolunteers.filter((v) => v.status === 'active').slice(0, 8).map((volunteer, index) => (
                <MarkerF
                  key={volunteer.id}
                  position={{
                    lat: (incidents?.[0]?.latitude ?? 40.7128) + 0.01 + index * 0.002,
                    lng: (incidents?.[0]?.longitude ?? -74.006) - 0.01 - index * 0.002,
                  }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 5,
                    fillColor: '#2563EB',
                    fillOpacity: 1,
                    strokeWeight: 1,
                    strokeColor: '#F1F5F9',
                  }}
                />
              ))}
            </GoogleMap>
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-base to-surface">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-border rounded-lg animate-pulse" />
                <p className="text-text-muted text-sm mb-2">Map View</p>
                <p className="text-xs text-text-muted max-w-xs">
                  Add your Google Maps API key to localStorage as `googleMapsApiKey` to enable live heatmap rendering.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-72 bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Live Incident Feed</h2>
            <p className="text-xs text-text-muted mt-1">
              {incidents?.length ?? 0} active incidents
            </p>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {incidentsLoading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : incidents && incidents.length > 0 ? (
              incidents.map((incident) => (
                <IncidentFeedItem key={incident.id} incident={incident} />
              ))
            ) : (
              <div className="p-4 text-center text-text-muted text-sm">
                No active incidents
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
