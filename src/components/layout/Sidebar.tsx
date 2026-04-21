import { Link, useLocation } from 'react-router-dom'
import {
  Globe,
  AlertTriangle,
  GitMerge,
  Users,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  MessageSquare,
  LogOut,
} from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', icon: Globe, path: '/dashboard' },
    { label: 'Crisis Reports', icon: AlertTriangle, path: '/crisis' },
    { label: 'Matching Engine', icon: GitMerge, path: '/matching' },
    { label: 'Volunteer Directory', icon: Users, path: '/volunteers' },
    { label: 'Digitization Hub', icon: ScanLine, path: '/digitization' },
    { label: 'Verification Center', icon: ShieldCheck, path: '/verification' },
    { label: 'Communication Hub', icon: MessageSquare, path: '/communication' },
    { label: 'AI Config', icon: SlidersHorizontal, path: '/ai-config' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="w-60 bg-surface border-r border-border flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-border">
        <div className="font-mono text-xl font-semibold">
          <span className="text-text-primary">NGO</span>
          <span className="text-action"> SYNERGY</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md mb-2 transition-colors ${
                isActive(item.path)
                  ? 'bg-action text-white'
                  : 'text-text-muted hover:bg-hover'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-action rounded-full flex items-center justify-center text-white text-xs font-semibold">
            SC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">Senior Coordinator</div>
            <div className="text-xs text-text-muted">Authorized User</div>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('authToken')
            window.location.href = '/login'
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-urgency transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
