import { Volunteer } from '@/types'
import { X } from 'lucide-react'
import SkillBadge from './SkillBadge'
import StatusBadge from './StatusBadge'
import ReliabilityScore from './ReliabilityScore'

interface VolunteerProfileSheetProps {
  volunteer: Volunteer | null
  open: boolean
  onClose: () => void
}

export default function VolunteerProfileSheet({
  volunteer,
  open,
  onClose,
}: VolunteerProfileSheetProps) {
  if (!open || !volunteer) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-96 bg-surface border-l border-border z-50 shadow-lg overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Volunteer Profile</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="w-12 h-12 bg-action rounded-full flex items-center justify-center text-white font-semibold mb-3">
              {volunteer.avatarInitials}
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {volunteer.name}
            </h3>
            <StatusBadge status={volunteer.status} />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Contact Information
            </label>
            <p className="text-text-primary font-mono text-sm">{volunteer.contact}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-3">
              Skills & Certifications
            </label>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-muted mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {volunteer.skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-2">Certifications</p>
                <div className="space-y-1">
                  {volunteer.certifications.map((cert) => (
                    <div key={cert} className="text-sm text-text-primary">
                      ✓ {cert}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Reliability Score
            </label>
            <ReliabilityScore score={volunteer.reliability} />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Past Deployments
            </label>
            <p className="text-2xl font-semibold text-action">{volunteer.pastDeployments}</p>
            <p className="text-xs text-text-muted mt-1">successful assignments</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-base border border-border rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Distance</p>
              <p className="text-lg font-semibold text-text-primary">
                {volunteer.distance}km
              </p>
            </div>
            <div className="bg-base border border-border rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Status</p>
              <p className="text-lg font-semibold text-text-primary capitalize">
                {volunteer.status}
              </p>
            </div>
          </div>

          <button className="w-full bg-action hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors">
            Assign to Task
          </button>
        </div>
      </div>
    </>
  )
}
