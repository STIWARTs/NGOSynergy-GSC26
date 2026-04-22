import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { reportsService } from '@/api/reports'

export default function PublicReportPage() {
  const [category, setCategory] = useState('Flood')
  const [reporterName, setReporterName] = useState('')
  const [severity, setSeverity] = useState(3)
  const [description, setDescription] = useState('')
  const [affectedCount, setAffectedCount] = useState(0)
  const [photoUrl, setPhotoUrl] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const submitMutation = useMutation({
    mutationFn: reportsService.submit,
  })

  const captureLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        })
      },
      () => {
        setCoords(null)
      }
    )
  }

  return (
    <div className="min-h-screen bg-base text-text-primary">
      <header className="bg-base border-b border-border px-6 py-4">
        <h1 className="text-xl font-mono">NGO Synergy: Emergency Request Portal</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
          <h2 className="font-mono">Submit Crisis Report</h2>

          <input
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full bg-base border border-border rounded px-3 py-2"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-base border border-border rounded px-3 py-2"
          >
            <option>Flood</option>
            <option>Earthquake</option>
            <option>Fire</option>
            <option>Landslide</option>
            <option>Medical Emergency</option>
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              max={5}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              placeholder="Severity 1-5"
              className="bg-base border border-border rounded px-3 py-2"
            />
            <input
              type="number"
              min={0}
              value={affectedCount}
              onChange={(e) => setAffectedCount(Number(e.target.value))}
              placeholder="Affected count"
              className="bg-base border border-border rounded px-3 py-2"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the incident"
            className="w-full bg-base border border-border rounded px-3 py-2 min-h-24"
          />

          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="Public photo URL"
            className="w-full bg-base border border-border rounded px-3 py-2"
          />

          <button onClick={captureLocation} className="px-4 py-2 rounded bg-base border border-border">
            Capture Location
          </button>
          {coords && (
            <p className="text-sm text-text-muted">
              Captured: {coords.lat}, {coords.lng}
            </p>
          )}

          <button
            onClick={() => {
              if (!coords || !photoUrl || !description) return
              submitMutation.mutate({
                category,
                severity,
                coordinates: coords,
                photoUrl,
                reporterName: reporterName || undefined,
                description,
                affectedCount,
              })
            }}
            disabled={submitMutation.isPending || !coords || !photoUrl || !description}
            className="px-4 py-2 rounded bg-action text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Report'}
          </button>

          {submitMutation.isSuccess && (
            <div className="bg-base border border-border rounded-lg p-4">
              <p className="font-mono">Tracking ID: {submitMutation.data.incidentId}</p>
              <p className="text-sm text-text-muted mt-2">
                Your report is submitted and queued for verification.
              </p>
            </div>
          )}
          {submitMutation.isError && (
            <p className="text-sm text-urgency">
              Submission failed. Ensure location and photo URL are valid, then retry.
            </p>
          )}
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-sm text-text-muted">
            Reports are validated by backend photo analysis and stored in the live incident pipeline.
          </p>
        </div>
      </main>
    </div>
  )
}
