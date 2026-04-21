interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'deployed'
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = (s: string) => {
    switch (s) {
      case 'active':
        return 'bg-action text-white'
      case 'deployed':
        return 'bg-yellow-600 text-white'
      case 'inactive':
        return 'bg-slate-600 text-white'
      default:
        return 'bg-slate-600 text-white'
    }
  }

  return (
    <span className={`inline-block ${getStatusStyles(status)} px-2 py-1 rounded-md text-xs font-semibold`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
