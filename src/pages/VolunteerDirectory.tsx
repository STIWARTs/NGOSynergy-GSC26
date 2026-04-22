import { useEffect, useMemo, useState } from 'react'
import { useVolunteers } from '@/hooks/useVolunteers'
import VolunteerTable from '@/components/shared/VolunteerTable'
import VolunteerProfileSheet from '@/components/shared/VolunteerProfileSheet'
import { Volunteer } from '@/types'
import { Search } from 'lucide-react'

export default function VolunteerDirectory() {
  const [search, setSearch] = useState('')
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [skillFilter, setSkillFilter] = useState<string>('')
  const [minReliability, setMinReliability] = useState<number>(0)
  const [page, setPage] = useState(1)
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | undefined>(undefined)
  const pageSize = 10

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition?.(
      (pos) => {
        setOrigin({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        })
      },
      () => {
        // Keep undefined; backend will omit distances
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }, [])

  const { data, isLoading, error } = useVolunteers(
    search || undefined,
    statusFilter || undefined,
    skillFilter || undefined,
    minReliability > 0 ? minReliability : undefined,
    page,
    pageSize,
    origin
  )
  const volunteers = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = useMemo(() => Math.min(page, totalPages), [page, totalPages])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, skillFilter, minReliability])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const handleViewProfile = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer)
    setProfileOpen(true)
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-mono font-semibold text-text-primary mb-4">
          Volunteer Directory
        </h1>
        <p className="text-text-muted text-sm">{total} volunteers available</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by name, skills, or certifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-action transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-border rounded-md px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-action transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deployed">Deployed</option>
          </select>
          <input
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            placeholder="Filter skill"
            className="bg-surface border border-border rounded-md px-4 py-2 text-sm text-text-primary"
          />
          <select
            value={minReliability}
            onChange={(e) => setMinReliability(Number(e.target.value))}
            className="bg-surface border border-border rounded-md px-4 py-2 text-sm text-text-primary"
          >
            <option value={0}>Any reliability</option>
            <option value={0.85}>0.85+</option>
            <option value={0.9}>0.90+</option>
            <option value={0.95}>0.95+</option>
          </select>
        </div>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-lg overflow-hidden flex flex-col min-h-0">
        <VolunteerTable
          data={volunteers}
          isLoading={isLoading}
          onViewProfile={handleViewProfile}
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded border border-border text-sm text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === 1 || totalPages <= 1}
        >
          Previous
        </button>
        <span className="text-sm text-text-muted">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 rounded border border-border text-sm text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage >= totalPages || totalPages <= 1}
        >
          Next
        </button>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center">
          Error loading volunteers: {error.message}
        </div>
      )}

      <VolunteerProfileSheet
        volunteer={selectedVolunteer}
        open={profileOpen}
        onClose={() => {
          setProfileOpen(false)
          setSelectedVolunteer(null)
        }}
      />
    </div>
  )
}
