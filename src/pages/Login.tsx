import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      localStorage.setItem('authToken', 'mock-token-' + Date.now())
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base to-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-lg p-8 shadow-lg">
          <div className="mb-8">
            <h1 className="text-3xl font-mono font-semibold text-center">
              <span className="text-text-primary">NGO</span>
              <span className="text-action"> SYNERGY</span>
            </h1>
            <p className="text-center text-text-muted text-sm mt-2">Admin Dashboard</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
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

            <button
              type="submit"
              className="w-full bg-action hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors mt-6"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-text-muted text-xs text-center">
              Demo credentials: Use any email and password
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
