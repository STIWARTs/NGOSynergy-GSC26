import { useState } from 'react'
import { Search, Bell, LogOut } from 'lucide-react'

export default function TopBar() {
  const [unreadCount] = useState(3)

  return (
    <div className="h-14 bg-surface border-b border-border flex items-center px-6 gap-4 fixed top-0 left-60 right-0 z-40">
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

        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <div className="w-8 h-8 bg-action rounded-full flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:bg-blue-700 transition-colors">
            SC
          </div>
        </div>
      </div>
    </div>
  )
}
