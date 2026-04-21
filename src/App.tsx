import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AIWeightsProvider } from './context/AIWeightsContext'
import { Toaster } from 'sonner'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/Login'
import PublicReportPage from './pages/PublicReport'

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
