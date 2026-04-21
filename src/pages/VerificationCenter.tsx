import { useMemo, useState } from 'react'
import { VerificationItem } from '@/types'
import { mockVerificationItems } from '@/lib/mockData'
import { toast } from 'sonner'
import * as Dialog from '@radix-ui/react-dialog'

export default function VerificationCenter() {
  const [items, setItems] = useState<VerificationItem[]>(mockVerificationItems)
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '')
  const [rejectReason, setRejectReason] = useState('Insufficient evidence')
  const [open, setOpen] = useState(false)

  const selectedItem = useMemo(() => items.find((item) => item.id === selectedId), [items, selectedId])

  const updateStatus = (status: 'verified' | 'rejected') => {
    if (!selectedItem) return
    setItems((prev) => prev.map((item) => (item.id === selectedItem.id ? { ...item, status } : item)))
    if (status === 'verified') {
      toast.error('Critical Incident Verified', {
        description: selectedItem.location,
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-mono font-semibold text-text-primary">Verification Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => (
          <Dialog.Root key={item.id} open={open && selectedId === item.id} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                onClick={() => {
                  setSelectedId(item.id)
                  setOpen(true)
                }}
                className="bg-surface border border-border rounded-lg overflow-hidden text-left"
              >
                <img src={item.photoUrl} alt={item.incidentType} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <p className="text-sm text-text-primary font-medium">{item.reporterName}</p>
                  <p className="text-xs text-text-muted">{item.incidentType} · {item.location}</p>
                </div>
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
              <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-2xl bg-surface border-l border-border z-50 p-5 overflow-y-auto">
                {selectedItem && (
                  <div className="space-y-4">
                    <Dialog.Title className="font-mono text-text-primary text-lg">AI Analysis Panel</Dialog.Title>
                    <img
                      src={selectedItem.photoUrl}
                      alt={selectedItem.incidentType}
                      className="w-full max-h-72 object-cover rounded border border-border"
                    />
                    <p className="text-sm text-text-primary">{selectedItem.reportText}</p>
                    <div className="bg-base border border-border rounded p-3">
                      <p className="text-xs text-text-muted mb-1">AI Visual Analysis</p>
                      <p className="text-sm text-text-primary">{selectedItem.aiAnalysis}</p>
                    </div>
                    <div className="bg-base border border-border rounded p-3 text-sm text-text-primary">
                      <p className="text-xs text-text-muted mb-1">Location Verification</p>
                      Reported: {selectedItem.reportedLocation.lat.toFixed(4)}, {selectedItem.reportedLocation.lng.toFixed(4)}
                      <br />
                      Submitted: {selectedItem.submissionLocation.lat.toFixed(4)}, {selectedItem.submissionLocation.lng.toFixed(4)}
                    </div>
                    <p className="text-sm text-text-muted">Community Confirmations: {selectedItem.communityConfirmations}</p>
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus('verified')} className="px-4 py-2 rounded bg-success text-white text-sm">Verify and Publish</button>
                      <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="px-2 py-2 rounded bg-base border border-border text-xs text-text-primary">
                        <option>Insufficient evidence</option>
                        <option>Location mismatch</option>
                        <option>Duplicate report</option>
                      </select>
                      <button onClick={() => updateStatus('rejected')} className="px-4 py-2 rounded bg-urgency text-white text-sm">Reject as Unverified</button>
                      <button onClick={() => toast.message('Forwarded to Government', { description: selectedItem.location })} className="px-4 py-2 rounded bg-action text-white text-sm">Forward to Government</button>
                    </div>
                  </div>
                )}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        ))}
      </div>
    </div>
  )
}
