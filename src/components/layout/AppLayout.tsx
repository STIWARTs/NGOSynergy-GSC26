import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import Dashboard from '@/pages/Dashboard'
import CrisisReports from '@/pages/CrisisReports'
import MatchingEngine from '@/pages/MatchingEngine'
import VolunteerDirectory from '@/pages/VolunteerDirectory'
import DigitizationHub from '@/pages/DigitizationHub'
import VerificationCenter from '@/pages/VerificationCenter'
import CommunicationHub from '@/pages/CommunicationHub'
import AIConfig from '@/pages/AIConfig'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-60">
        <TopBar />
        <main className="flex-1 overflow-auto mt-16 px-6 py-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crisis" element={<CrisisReports />} />
            <Route path="/matching" element={<MatchingEngine />} />
            <Route path="/volunteers" element={<VolunteerDirectory />} />
            <Route path="/digitization" element={<DigitizationHub />} />
            <Route path="/verification" element={<VerificationCenter />} />
            <Route path="/communication" element={<CommunicationHub />} />
            <Route path="/ai-config" element={<AIConfig />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
