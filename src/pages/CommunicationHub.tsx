import { useState } from 'react'

export default function CommunicationHub() {
  const [channel, setChannel] = useState<'ops' | 'medical' | 'logistics'>('ops')
  const [message, setMessage] = useState('')
  const [feed, setFeed] = useState<string[]>([
    '[Ops] Team Alpha deployed to Downtown District.',
    '[Medical] Supplies en route to Camp Delta.',
    '[Logistics] Temporary shelter capacity at 78%.',
  ])

  const sendMessage = () => {
    if (!message.trim()) return
    const prefix = channel === 'ops' ? '[Ops]' : channel === 'medical' ? '[Medical]' : '[Logistics]'
    setFeed((prev) => [`${prefix} ${message.trim()}`, ...prev])
    setMessage('')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-mono font-semibold text-text-primary">Communication Hub</h1>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="flex gap-2">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as 'ops' | 'medical' | 'logistics')}
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          >
            <option value="ops">Operations</option>
            <option value="medical">Medical</option>
            <option value="logistics">Logistics</option>
          </select>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type coordination message..."
            className="flex-1 bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
          <button onClick={sendMessage} className="px-4 py-2 bg-action text-white rounded text-sm">
            Send
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4">
        <h2 className="font-mono text-text-primary mb-3">Live Coordination Feed</h2>
        <div className="space-y-2 max-h-[420px] overflow-y-auto">
          {feed.map((entry) => (
            <div key={entry} className="border border-border rounded px-3 py-2 text-sm text-text-primary">
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
