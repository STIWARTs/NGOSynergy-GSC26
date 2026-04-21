interface ReliabilityScoreProps {
  score: number
}

export default function ReliabilityScore({ score }: ReliabilityScoreProps) {
  const getColorByScore = (s: number) => {
    if (s >= 0.95) return 'text-success'
    if (s >= 0.85) return 'text-action'
    if (s >= 0.75) return 'text-yellow-500'
    return 'text-urgency'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${score >= 0.95 ? 'bg-success' : score >= 0.85 ? 'bg-action' : score >= 0.75 ? 'bg-yellow-500' : 'bg-urgency'}`}
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <span className={`${getColorByScore(score)} text-sm font-semibold`}>
        {(score * 100).toFixed(0)}%
      </span>
    </div>
  )
}
