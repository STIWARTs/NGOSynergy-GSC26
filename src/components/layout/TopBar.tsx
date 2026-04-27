import { useEffect, useState } from 'react'
import { Search, Bell, ChevronDown, LogOut, Settings, Moon, Sun } from 'lucide-react'

export default function TopBar() {
  const [unreadCount] = useState(3)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div className="h-16 bg-surface border-b border-border flex items-center px-6 gap-4 fixed top-0 left-60 right-0 z-40">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
        <input
          type="text"
          placeholder="Search incidents, volunteers, locations..."
          className="w-full bg-base border border-border rounded-md pl-10 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-action transition-colors"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell size={20} className="text-text-muted cursor-pointer hover:text-text-primary transition-colors" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-urgency text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </div>
        <button
          onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          className="p-2 rounded-md border border-border text-text-muted hover:text-text-primary hover:border-action hover:bg-hover transition-colors"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 hover:bg-hover rounded-md px-2 py-1"
          >
            <div className="w-8 h-8 bg-action rounded-full flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:bg-blue-700 transition-colors">
              SC
            </div>
            <ChevronDown size={14} className="text-text-muted" />
          </button>
          {menuOpen && (
            <div className="absolute right-6 top-16 w-44 bg-surface border border-border rounded-md shadow-lg z-50">
              <button className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-hover flex items-center gap-2">
                <Settings size={14} />
                Settings
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('authToken')
                  window.location.href = '/login'
                }}
                className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-hover flex items-center gap-2"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
