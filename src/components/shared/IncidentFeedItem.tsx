import { Incident } from '@/types'
import { ShieldCheck } from 'lucide-react'

interface IncidentFeedItemProps {
  incident: Incident
}

export default function IncidentFeedItem({ incident }: IncidentFeedItemProps) {
  const getUrgencyColor = (score: number) => {
    if (score >= 70) return 'bg-urgency'
    if (score >= 50) return 'bg-yellow-600'
    return 'bg-blue-600'
  }

  const getUrgencyLabel = (score: number) => {
    if (score >= 70) return 'Critical'
    if (score >= 50) return 'High'
    return 'Medium'
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className="border-b border-border p-4 hover:bg-hover cursor-pointer transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-muted">{timeAgo(incident.timestamp)}</div>
          <div className="text-sm font-medium text-text-primary truncate">{incident.title}</div>
        </div>
        {incident.geminiVerified && (
          <ShieldCheck size={14} className="text-action flex-shrink-0" />
        )}
      </div>

      <div className="text-xs text-text-muted truncate mb-2">{incident.location}</div>

      <div className="flex items-center gap-2">
        <span className={`${getUrgencyColor(incident.urgencyScore)} text-white text-xs font-semibold px-2 py-1 rounded-md`}>
          {getUrgencyLabel(incident.urgencyScore)}
        </span>
        <span className="text-xs text-text-muted">{incident.category}</span>
      </div>
    </div>
  )
}
