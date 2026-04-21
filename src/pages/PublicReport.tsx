import { useState } from 'react'

export default function PublicReportPage() {
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpError, setOtpError] = useState('')
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

  const sendOtp = () => {
    const normalized = phone.replace(/\D/g, '')
    if (normalized.length < 10) {
      setOtpError('Enter a valid phone number before requesting OTP.')
      return
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    setGeneratedOtp(otp)
    setOtpSent(true)
    setOtpVerified(false)
    setEnteredOtp('')
    setOtpError('')
  }

  const verifyOtp = () => {
    if (enteredOtp === generatedOtp) {
      setOtpVerified(true)
      setOtpError('')
      return
    }
    setOtpError('Invalid OTP. Please check the code and try again.')
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
              onClick={sendOtp}
              className="px-4 py-2 rounded bg-action text-white"
              disabled={!phone.trim()}
            >
              Send OTP
            </button>
          </div>
          {otpSent && (
            <div className="space-y-2">
              <p className="text-xs text-text-muted">Demo OTP: {generatedOtp}</p>
              <div className="flex gap-2">
                <input
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="flex-1 bg-base border border-border rounded px-3 py-2"
                />
                <button onClick={verifyOtp} className="px-4 py-2 rounded bg-base border border-border">
                  Verify OTP
                </button>
              </div>
              {otpError && <p className="text-xs text-urgency">{otpError}</p>}
            </div>
          )}
        </div>

        {otpVerified && !trackingId && (
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
              onClick={() => {
                if (!location || !fileName) {
                  setOtpError('Capture location and upload evidence before submitting.')
                  return
                }
                setTrackingId(`NGO-${Date.now().toString().slice(-6)}`)
              }}
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
