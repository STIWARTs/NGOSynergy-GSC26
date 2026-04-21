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

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Deployment History</label>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 text-xs text-text-muted bg-base px-3 py-2">
                <span>Mission</span>
                <span>Role</span>
                <span>Outcome</span>
              </div>
              {[1, 2, 3].map((entry) => (
                <div key={entry} className="grid grid-cols-3 px-3 py-2 text-xs border-t border-border">
                  <span className="text-text-primary">Response #{entry}</span>
                  <span className="text-text-muted">{volunteer.skills[0]}</span>
                  <span className="text-success">Completed</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Reliability Trend</label>
            <div className="h-20 border border-border rounded-lg p-3 flex items-end gap-2 bg-base">
              {[0.82, 0.86, 0.88, 0.91, volunteer.reliability].map((value, idx) => (
                <div key={idx} className="flex-1 bg-action/70 rounded-sm" style={{ height: `${value * 70}px` }} />
              ))}
            </div>
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
