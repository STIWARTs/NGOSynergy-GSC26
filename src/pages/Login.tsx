import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  isFirebaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  getIdToken,
} from '@/lib/firebase'

type Tab = 'signin' | 'signup'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (tab === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!isFirebaseConfigured) {
      // Fallback: mock auth (works without Firebase web config)
      localStorage.setItem('authToken', 'dev-token-' + Date.now())
      navigate('/dashboard')
      return
    }

    setLoading(true)
    try {
      if (tab === 'signup') {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      // Firebase auth state will trigger App.tsx re-render → redirect handled there
      const token = await getIdToken()
      if (token) localStorage.setItem('authToken', token)
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err.message || 'Authentication failed.'
      // Friendly error messages
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Invalid email or password.')
      } else if (msg.includes('email-already-in-use')) {
        setError('This email is already registered. Sign in instead.')
      } else if (msg.includes('weak-password')) {
        setError('Password must be at least 6 characters.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Please add your Firebase Web SDK credentials to .env.local.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      const token = await getIdToken()
      if (token) localStorage.setItem('authToken', token)
      navigate('/dashboard')
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed.')
      } else {
        setError(err.message || 'Google sign-in failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base to-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-lg p-8 shadow-lg">
          {/* Logo / title */}
          <div className="mb-8">
            <h1 className="text-3xl font-mono font-semibold text-center">
              <span className="text-text-primary">NGO</span>
              <span className="text-action"> SYNERGY</span>
            </h1>
            <p className="text-center text-text-muted text-sm mt-2">Admin Dashboard</p>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border border-border rounded-md overflow-hidden">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'signin'
                  ? 'bg-action text-white'
                  : 'bg-base text-text-muted hover:text-text-primary'
              }`}
              onClick={() => { setTab('signin'); setError('') }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'signup'
                  ? 'bg-action text-white'
                  : 'bg-base text-text-muted hover:text-text-primary'
              }`}
              onClick={() => { setTab('signup'); setError('') }}
            >
              Create Account
            </button>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-base border border-border rounded-md px-4 py-2 text-text-primary text-sm font-medium hover:bg-surface transition-colors mb-4 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ngocommunity.org"
                className="w-full bg-base border border-border rounded-md px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-action transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-base border border-border rounded-md px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-action transition-colors"
              />
            </div>

            {tab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-base border border-border rounded-md px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-action transition-colors"
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-action hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? tab === 'signup' ? 'Creating Account...' : 'Signing In...'
                : tab === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle link */}
          <div className="mt-5 text-center text-sm text-text-muted">
            {tab === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  className="text-action hover:underline font-medium"
                  onClick={() => { setTab('signup'); setError('') }}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  className="text-action hover:underline font-medium"
                  onClick={() => { setTab('signin'); setError('') }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          {!isFirebaseConfigured && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-text-muted text-xs text-center">
                Dev mode: Use any email & password to access the dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
