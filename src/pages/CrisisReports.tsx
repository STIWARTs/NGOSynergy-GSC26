import { useMemo, useState } from 'react'
import { mockIncidents } from '@/lib/mockData'

export default function CrisisReports() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'pending' | 'resolved'>('all')

  const filteredIncidents = useMemo(() => {
    return mockIncidents.filter((incident) => {
      const matchesSearch =
        incident.title.toLowerCase().includes(query.toLowerCase()) ||
        incident.location.toLowerCase().includes(query.toLowerCase()) ||
        incident.category.toLowerCase().includes(query.toLowerCase())

      const matchesStatus = status === 'all' ? true : incident.status === status
      return matchesSearch && matchesStatus
    })
  }, [query, status])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-mono font-semibold text-text-primary">Crisis Reports</h1>

      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, category, or location"
            className="flex-1 bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'pending' | 'resolved')}
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border text-xs text-text-muted font-mono">
          <span className="col-span-4">Incident</span>
          <span className="col-span-2">Category</span>
          <span className="col-span-2">Urgency</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Affected</span>
        </div>
        {filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border last:border-b-0 text-sm"
          >
            <div className="col-span-4">
              <p className="text-text-primary font-medium">{incident.title}</p>
              <p className="text-text-muted text-xs">{incident.location}</p>
            </div>
            <span className="col-span-2 text-text-primary">{incident.category}</span>
            <span className="col-span-2 text-text-primary">{incident.urgencyScore}</span>
            <span className="col-span-2">
              <span className="px-2 py-1 rounded bg-base border border-border text-text-primary text-xs">
                {incident.status}
              </span>
            </span>
            <span className="col-span-2 text-text-primary">{incident.affectedCount}</span>
          </div>
        ))}
        {filteredIncidents.length === 0 && (
          <p className="p-6 text-sm text-text-muted text-center">No incidents match your filters.</p>
        )}
      </div>
    </div>
  )
}
