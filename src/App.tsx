import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AIWeightsProvider } from './context/AIWeightsContext'
import { Toaster, toast } from 'sonner'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/Login'
import PublicReportPage from './pages/PublicReport'
import { GLOBAL_TOAST_EVENT, GlobalToastEventDetail } from './lib/events'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
})

function App() {
  const skipAuth = localStorage.getItem('skipAuth') === 'true'
  const isAuthenticated = skipAuth || !!localStorage.getItem('authToken')

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
          <Toaster theme="dark" />
        </Router>
      </AIWeightsProvider>
    </QueryClientProvider>
  )
}

export default App
