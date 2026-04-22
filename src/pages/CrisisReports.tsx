import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useIncidents } from '@/hooks/useIncidents'
import { reportsService } from '@/api/reports'
import { queryKeys } from '@/lib/queryKeys'

export default function CrisisReports() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'pending' | 'resolved' | 'verified'>('all')
  const [category, setCategory] = useState('Flood')
  const [severity, setSeverity] = useState(3)
  const [reporterName, setReporterName] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [affectedCount, setAffectedCount] = useState(0)
  const queryClient = useQueryClient()
  const { data: incidents = [], isLoading } = useIncidents()

  const submitReport = useMutation({
    mutationFn: reportsService.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all })
      setReporterName('')
      setDescription('')
      setPhotoUrl('')
      setLat('')
      setLng('')
      setAffectedCount(0)
    },
  })

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        incident.title.toLowerCase().includes(query.toLowerCase()) ||
        incident.location.toLowerCase().includes(query.toLowerCase()) ||
        incident.category.toLowerCase().includes(query.toLowerCase())

      const matchesStatus = status === 'all' ? true : incident.status === status
      return matchesSearch && matchesStatus
    })
  }, [incidents, query, status])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-mono font-semibold text-text-primary">Crisis Reports</h1>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Submit New Crisis Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            placeholder="Reporter name"
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          >
            <option>Flood</option>
            <option>Earthquake</option>
            <option>Fire</option>
            <option>Landslide</option>
            <option>Medical Emergency</option>
          </select>
          <input
            type="number"
            min={1}
            max={5}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
            placeholder="Severity (1-5)"
          />
          <input
            type="number"
            min={0}
            value={affectedCount}
            onChange={(e) => setAffectedCount(Number(e.target.value))}
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
            placeholder="Affected count"
          />
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Longitude"
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="Public photo URL"
            className="md:col-span-2 bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Incident description"
            className="md:col-span-2 bg-base border border-border rounded px-3 py-2 text-sm text-text-primary min-h-24"
          />
        </div>
        <button
          onClick={() =>
            submitReport.mutate({
              category,
              severity,
              coordinates: { lat: Number(lat), lng: Number(lng) },
              photoUrl,
              reporterName: reporterName || undefined,
              description: description || undefined,
              affectedCount,
            })
          }
          disabled={
            submitReport.isPending ||
            !photoUrl ||
            !description ||
            !lat ||
            !lng ||
            Number.isNaN(Number(lat)) ||
            Number.isNaN(Number(lng))
          }
          className="px-4 py-2 rounded bg-action text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitReport.isPending ? 'Submitting...' : 'Submit Report'}
        </button>
        {submitReport.isError && (
          <p className="text-xs text-red-500">Failed to submit report. Please check fields and try again.</p>
        )}
        {submitReport.isSuccess && (
          <p className="text-xs text-green-500">
            Report submitted. Incident ID: {submitReport.data.incidentId}
          </p>
        )}
      </div>

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
            onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'pending' | 'resolved' | 'verified')}
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
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
        {!isLoading && filteredIncidents.map((incident) => (
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
        {isLoading && (
          <p className="p-6 text-sm text-text-muted text-center">Loading incidents...</p>
        )}
        {filteredIncidents.length === 0 && (
          <p className="p-6 text-sm text-text-muted text-center">No incidents match your filters.</p>
        )}
      </div>
    </div>
  )
}
