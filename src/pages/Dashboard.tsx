import { useActiveIncidents, useIncidentStats } from '@/hooks/useIncidents'
import StatCard from '@/components/shared/StatCard'
import IncidentFeedItem from '@/components/shared/IncidentFeedItem'
import { Skeleton } from '@/components/shared/Skeleton'

export default function Dashboard() {
  const { data: incidents, isLoading: incidentsLoading } = useActiveIncidents()
  const { data: stats, isLoading: statsLoading } = useIncidentStats()

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
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-base to-surface">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-border rounded-lg animate-pulse" />
              <p className="text-text-muted text-sm mb-2">Map View</p>
              <p className="text-xs text-text-muted max-w-xs">
                Google Maps with heatmap layer showing {incidents?.length ?? 0} active incidents
              </p>
            </div>
          </div>
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
