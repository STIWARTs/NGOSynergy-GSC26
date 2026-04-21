import { useState } from 'react'
import { ChevronLeft, Check, AlertCircle, Trash2 } from 'lucide-react'
import {
  useApproveDigitization,
  useDigitizationQueue,
  useDiscardDigitization,
  useRescanDigitization,
} from '@/hooks/useDigitization'
import { DigitizedExtraction } from '@/types'

interface HITLVerificationProps {
  itemId: string
  onBack: () => void
}

export default function HITLVerification({ itemId, onBack }: HITLVerificationProps) {
  const { data: queue = [] } = useDigitizationQueue()
  const item = queue.find((i) => i.id === itemId)
  const approveMutation = useApproveDigitization()
  const rescanMutation = useRescanDigitization()
  const discardMutation = useDiscardDigitization()
  const [formData, setFormData] = useState<DigitizedExtraction>(item?.extractedData ?? {})

  if (!item) return null

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleApprove = async () => {
    await approveMutation.mutateAsync({ id: itemId, extractedData: formData })
    onBack()
  }

  const handleFlag = async () => {
    await rescanMutation.mutateAsync(itemId)
    onBack()
  }

  const handleDiscard = async () => {
    if (confirm('Are you sure you want to discard this document?')) {
      await discardMutation.mutateAsync(itemId)
      onBack()
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-action hover:text-action/80 transition-colors font-mono"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Queue
      </button>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-mono font-semibold text-text-primary text-lg">
            Human-In-The-Loop Verification
          </h2>
          <p className="text-text-muted text-sm mt-1">{item.filename}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6 min-h-96">
          <div className="relative overflow-hidden rounded-lg bg-base border border-border group">
            <img
              src={item.imageUrl}
              alt="Document"
              className="w-full h-full object-cover"
            />
            {item.status === 'processing' && (
              <div className="absolute inset-0 animate-pulse">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-action to-transparent animate-pulse" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-text-muted mb-2">
                Incident Type
              </label>
              <input
                type="text"
                value={formData.incidentType || ''}
                onChange={(e) => handleFieldChange('incidentType', e.target.value)}
                className="w-full bg-base border border-border rounded px-3 py-2 text-text-primary font-mono text-sm placeholder-text-muted focus:outline-none focus:border-action"
                placeholder="e.g., Flood, Earthquake"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-text-muted mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                className="w-full bg-base border border-border rounded px-3 py-2 text-text-primary font-mono text-sm placeholder-text-muted focus:outline-none focus:border-action"
                placeholder="e.g., North Ward, River Basin"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-mono text-text-muted mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="w-full bg-base border border-border rounded px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-action"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-text-muted mb-2">
                  Severity
                </label>
                <select
                  value={formData.severity || ''}
                  onChange={(e) => handleFieldChange('severity', e.target.value)}
                  className="w-full bg-base border border-border rounded px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-action"
                >
                  <option value="">Select</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-mono text-text-muted mb-2">
                Reporter Name
              </label>
              <input
                type="text"
                value={formData.reporterName || ''}
                onChange={(e) => handleFieldChange('reporterName', e.target.value)}
                className="w-full bg-base border border-border rounded px-3 py-2 text-text-primary font-mono text-sm placeholder-text-muted focus:outline-none focus:border-action"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-text-muted mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full bg-base border border-border rounded px-3 py-2 text-text-primary font-mono text-sm placeholder-text-muted focus:outline-none focus:border-action resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-text-muted mb-2">
                Affected Count
              </label>
              <input
                type="number"
                value={formData.affectedCount || ''}
                onChange={(e) => handleFieldChange('affectedCount', e.target.value)}
                className="w-full bg-base border border-border rounded px-3 py-2 text-text-primary font-mono text-sm placeholder-text-muted focus:outline-none focus:border-action"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 bg-base flex gap-3 justify-end">
          <button
            onClick={handleFlag}
            disabled={rescanMutation.isPending || discardMutation.isPending || approveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:border-text-muted rounded font-mono text-sm text-text-primary transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            Flag for Rescan
          </button>
          <button
            onClick={handleDiscard}
            disabled={rescanMutation.isPending || discardMutation.isPending || approveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-urgency hover:bg-urgency/10 rounded font-mono text-sm text-urgency transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Discard
          </button>
          <button
            onClick={handleApprove}
            disabled={rescanMutation.isPending || discardMutation.isPending || approveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-action hover:bg-action/80 rounded font-mono text-sm text-white transition-colors"
          >
            <Check className="w-4 h-4" />
            Approve and Commit
          </button>
        </div>
      </div>
    </div>
  )
}
