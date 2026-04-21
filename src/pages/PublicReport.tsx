import { useState } from 'react'

export default function PublicReportPage() {
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [category, setCategory] = useState('Flood')
  const [location, setLocation] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [trackingId, setTrackingId] = useState<string | null>(null)

  const captureLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`)
      },
      () => {
        setLocation('Unable to capture location')
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
          <h2 className="font-mono">Step 1: Verify Phone</h2>
          <div className="flex gap-2">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="flex-1 bg-base border border-border rounded px-3 py-2"
            />
            <button
              onClick={() => setOtpSent(true)}
              className="px-4 py-2 rounded bg-action text-white"
              disabled={!phone.trim()}
            >
              Send OTP
            </button>
          </div>
        </div>

        {otpSent && !trackingId && (
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <h2 className="font-mono">Step 2: Incident Form</h2>
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

            <button onClick={captureLocation} className="px-4 py-2 rounded bg-base border border-border">
              Capture Location
            </button>
            {location && <p className="text-sm text-text-muted">Captured: {location}</p>}

            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              className="block w-full text-sm"
            />
            {fileName && <p className="text-sm text-text-muted">Evidence: {fileName}</p>}

            <button
              onClick={() => setTrackingId(`NGO-${Date.now().toString().slice(-6)}`)}
              className="px-4 py-2 rounded bg-action text-white"
            >
              Submit Request
            </button>
          </div>
        )}

        {trackingId && (
          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="font-mono">Tracking ID: {trackingId}</p>
            <p className="text-sm text-text-muted mt-2">
              Your request is verified and being matched with a nearby volunteer.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
