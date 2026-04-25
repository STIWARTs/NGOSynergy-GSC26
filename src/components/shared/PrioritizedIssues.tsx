/**
 * PrioritizedIssues — Dashboard panel showing crises from the Data Digitization Pipeline
 * Sorted by AI-computed priorityScore (Category × 0.4 + Severity × 0.3 + Scale × 0.2 + WaitTime × 0.1)
 */

import { useCrises, useUpdateCrisisStatus } from '@/hooks/useCrises'
import { useState } from 'react'
import { Activity, Droplets, Heart, Home, LifeBuoy, ShieldAlert, Clock, Users, TrendingUp, RefreshCw } from 'lucide-react'

// ─── Category metadata ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  Health: { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  Rescue: { icon: LifeBuoy, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  Water: { icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  Food: { icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  Shelter: { icon: Home, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
}

const URGENCY_BADGE: Record<string, string> = {
  HIGH: 'bg-red-500/20 text-red-400 border border-red-500/30',
  MEDIUM: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  LOW: 'bg-green-500/20 text-green-400 border border-green-500/30',
}

// ─── Priority ring helper ────────────────────────────────────────────────────────

function PriorityRing({ score }: { score: number }) {
  const maxScore = 10
  const pct = Math.min(score / maxScore, 1)
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)

  const color = pct > 0.8 ? '#ef4444' : pct > 0.55 ? '#f59e0b' : '#22c55e'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 52, height: 52 }}>
      <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="26" cy="26" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
        <circle
          cx="26"
          cy="26"
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}

// ─── Breakdown bar helper ────────────────────────────────────────────────────────

function BreakdownBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-text-muted">
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%`, transition: 'width 0.5s ease' }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function PrioritizedIssues() {
  const { data, isLoading, refetch, isFetching } = useCrises(20)
  const updateStatus = useUpdateCrisisStatus()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const crises = data?.crises ?? []

  const filtered = filterCategory === 'all'
    ? crises
    : crises.filter((c) => c.category === filterCategory)

  const categories = ['all', 'Health', 'Rescue', 'Water', 'Food', 'Shelter']

  function formatTime(ts: any): string {
    try {
      const date = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
      const diff = (Date.now() - date.getTime()) / 1000 / 60
      if (diff < 60) return `${Math.round(diff)}m ago`
      if (diff < 1440) return `${Math.round(diff / 60)}h ago`
      return `${Math.round(diff / 1440)}d ago`
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-indigo-500/10 to-violet-500/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-text-primary">Prioritized Issues</h2>
            <span className="text-xs text-text-muted font-mono bg-white/5 px-2 py-0.5 rounded-full">
              Pipeline Output
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">{filtered.length} issues</span>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Pipeline architecture badge */}
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted flex-wrap">
          {['OCR', '→', 'Preprocess', '→', 'Gemini AI', '→', 'Validate', '→', 'Priority Score', '→', 'Firestore'].map((step, i) => (
            <span
              key={i}
              className={step === '→' ? 'text-white/20' : 'px-2 py-0.5 bg-white/5 rounded text-indigo-300/70 font-mono'}
            >
              {step}
            </span>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {categories.map((cat) => {
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  filterCategory === cat
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-white/5 text-text-muted border border-white/10 hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto" style={{ maxHeight: 520 }}>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <ShieldAlert className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm text-text-muted">No issues found</p>
            <p className="text-xs text-text-muted mt-1 opacity-60">
              Upload documents via Digitization Hub to generate prioritized crises
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filtered.map((crisis, index) => {
              const cfg = CATEGORY_CONFIG[crisis.category] || CATEGORY_CONFIG['Water']
              const Icon = cfg.icon
              const isExpanded = expandedId === crisis.id

              return (
                <div
                  key={crisis.id}
                  className={`rounded-lg border transition-all cursor-pointer ${cfg.border} ${cfg.bg} ${
                    isExpanded ? 'shadow-lg' : 'hover:shadow-md'
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : crisis.id)}
                >
                  {/* Main row */}
                  <div className="p-3 flex items-center gap-3">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-text-muted">
                      {index + 1}
                    </div>

                    {/* Priority ring */}
                    <div className="flex-shrink-0">
                      <PriorityRing score={crisis.priorityScore} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color}`} />
                        <span className={`text-xs font-semibold ${cfg.color}`}>{crisis.category}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${URGENCY_BADGE[crisis.urgency]}`}>
                          {crisis.urgency}
                        </span>
                        {crisis.status !== 'pending' && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            crisis.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                            crisis.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {crisis.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-primary line-clamp-1 font-medium">
                        {crisis.location_name}
                      </p>
                      <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                        {crisis.summary}
                      </p>
                    </div>

                    {/* Right side stats */}
                    <div className="flex-shrink-0 text-right space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-text-muted justify-end">
                        <Users className="w-3 h-3" />
                        <span>{(crisis.people_affected || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-text-muted justify-end">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(crisis.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-4 border-t border-white/10 mt-1 pt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Priority breakdown */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[11px] font-semibold text-text-primary">Priority Breakdown</span>
                          <span className="text-[10px] text-text-muted font-mono">
                            Score: {crisis.priorityScore.toFixed(2)}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <BreakdownBar
                            label="Category Weight (×0.4)"
                            value={crisis.priorityBreakdown?.categoryScore ?? 0}
                            max={4}
                            color="bg-rose-500"
                          />
                          <BreakdownBar
                            label="Severity (×0.3)"
                            value={crisis.priorityBreakdown?.severityScore ?? 0}
                            max={3}
                            color="bg-amber-500"
                          />
                          <BreakdownBar
                            label="Scale / People (×0.2)"
                            value={crisis.priorityBreakdown?.scaleScore ?? 0}
                            max={2}
                            color="bg-blue-500"
                          />
                          <BreakdownBar
                            label="Wait Time (×0.1)"
                            value={crisis.priorityBreakdown?.waitTimeScore ?? 0}
                            max={1}
                            color="bg-purple-500"
                          />
                        </div>
                        <p className="text-[10px] text-text-muted mt-2 font-mono opacity-60">
                          Formula: (Cat×0.4) + (Sev×0.3) + (Scale×0.2) + (Wait×0.1)
                        </p>
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-text-muted mb-3 leading-relaxed">{crisis.summary}</p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {crisis.status === 'pending' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: crisis.id, status: 'active' })}
                            disabled={updateStatus.isPending}
                            className="flex-1 text-xs py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors font-medium"
                          >
                            Mark Active
                          </button>
                        )}
                        {crisis.status !== 'resolved' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: crisis.id, status: 'resolved' })}
                            disabled={updateStatus.isPending}
                            className="flex-1 text-xs py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors font-medium"
                          >
                            Resolve
                          </button>
                        )}
                        {crisis.status !== 'dismissed' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: crisis.id, status: 'dismissed' })}
                            disabled={updateStatus.isPending}
                            className="text-xs py-1.5 px-3 rounded-lg bg-white/5 text-text-muted border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
