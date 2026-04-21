import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { useDigitizationQueue, useUploadDigitizationFiles } from '@/hooks/useDigitization'

interface SingleDocumentProps {
  onSelectForVerification: (itemId: string) => void
}

export default function SingleDocument({ onSelectForVerification }: SingleDocumentProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { data: queue = [] } = useDigitizationQueue()
  const uploadMutation = useUploadDigitizationFiles('single')
  const singleDocItems = queue.filter((item) => item.pageCount === 1 && item.status !== 'discarded')

  return (
    <div className="space-y-6">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border hover:border-action/50 rounded-lg p-8 text-center cursor-pointer transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length > 0) {
              void uploadMutation.mutateAsync([files[0]])
            }
            e.target.value = ''
          }}
        />
        <Upload className="w-6 h-6 text-text-muted mx-auto mb-2" />
        <p className="font-mono text-sm text-text-primary">Upload a single field document</p>
        <p className="text-xs text-text-muted mt-1">Click to choose PDF, JPG, or PNG</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {singleDocItems.map((item) => (
        <div
          key={item.id}
          className="bg-surface border border-border rounded-lg overflow-hidden hover:border-action/50 transition-colors group cursor-pointer"
          onClick={() => onSelectForVerification(item.id)}
        >
          <div className="relative overflow-hidden bg-base h-48">
            <img
              src={item.imageUrl}
              alt={item.filename}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="p-4">
            <p className="font-mono text-sm text-text-primary font-semibold truncate">
              {item.filename}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {item.uploadedAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span
                className={`text-xs px-2 py-1 rounded font-mono ${
                  item.status === 'processed'
                    ? 'bg-success/10 text-success'
                    : item.status === 'pending' || item.status === 'processing' || item.status === 'uploading'
                      ? 'bg-action/10 text-action'
                      : 'bg-urgency/10 text-urgency'
                }`}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
              {(item.extractedData || item.status === 'failed' || item.status === 'rescanned') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectForVerification(item.id)
                  }}
                  className="text-xs px-2 py-1 bg-action hover:bg-action/80 text-white rounded font-mono transition-colors"
                >
                  Review
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {singleDocItems.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-text-muted">No single documents available</p>
        </div>
      )}
      </div>
    </div>
  )
}
