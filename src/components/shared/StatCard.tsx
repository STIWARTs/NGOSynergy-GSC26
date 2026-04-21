import { Skeleton } from './Skeleton'

interface StatCardProps {
  label: string
  value: string | number
  isLoading?: boolean
}

export default function StatCard({ label, value, isLoading = false }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32" />
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="text-sm font-medium text-text-muted mb-2">{label}</div>
      <div className="text-3xl font-semibold text-text-primary">{value}</div>
    </div>
  )
}
