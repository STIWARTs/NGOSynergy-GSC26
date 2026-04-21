import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AIWeightsProvider } from './context/AIWeightsContext'
import { Toaster, toast } from 'sonner'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/Login'
import PublicReportPage from './pages/PublicReport'
import { GLOBAL_TOAST_EVENT, GlobalToastEventDetail } from './lib/events'
import { onFirebaseAuthChange, isFirebaseConfigured, User, getIdToken } from './lib/firebase'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
})

function App() {
  // If Firebase is configured, auth state is driven by it.
  // Otherwise fall back to localStorage token (dev mode).
  const [authChecked, setAuthChecked] = useState(!isFirebaseConfigured)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)

  const localToken = localStorage.getItem('authToken') || localStorage.getItem('skipAuth')
  const isAuthenticated = isFirebaseConfigured
    ? authChecked && firebaseUser !== null
    : !!localToken

  const [theme, setTheme] = useState<'dark' | 'light'>(
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  )

  // Listen to Firebase auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured) return
    const unsub = onFirebaseAuthChange(async (user) => {
      setFirebaseUser(user)
      if (user) {
        // Refresh the ID token in localStorage so API calls always have a fresh token
        const token = await getIdToken()
        if (token) localStorage.setItem('authToken', token)
      } else {
        localStorage.removeItem('authToken')
      }
      setAuthChecked(true)
    })
    return unsub
  }, [])

  useEffect(() => {
    const handleGlobalToast = (event: Event) => {
      const detail = (event as CustomEvent<GlobalToastEventDetail>).detail
      if (detail.type === 'critical_verified') {
        toast.error(detail.title, { description: detail.description })
        return
      }
      if (detail.type === 'error') {
        toast.error(detail.title, { description: detail.description })
        return
      }
      toast.message(detail.title, { description: detail.description })
    }

    window.addEventListener(GLOBAL_TOAST_EVENT, handleGlobalToast)
    return () => window.removeEventListener(GLOBAL_TOAST_EVENT, handleGlobalToast)
  }, [])

  useEffect(() => {
    const syncTheme = () => {
      const currentTheme = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
      setTheme(currentTheme)
    }

    syncTheme()
    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('storage', syncTheme)

    return () => {
      observer.disconnect()
      window.removeEventListener('storage', syncTheme)
    }
  }, [])

  // Show blank while Firebase checks auth state
  if (isFirebaseConfigured && !authChecked) {
    return <div className="min-h-screen bg-base" />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AIWeightsProvider>
        <Router>
          <Routes>
            <Route path="/report" element={<PublicReportPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                isAuthenticated ? (
                  <AppLayout />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
          <Toaster theme={theme} />
        </Router>
      </AIWeightsProvider>
    </QueryClientProvider>
  )
}

export default App
