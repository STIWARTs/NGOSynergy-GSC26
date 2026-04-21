import { useRef, useState } from 'react'
import { Upload, X, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { useDigitizationProgress, useDigitizationQueue, useUploadDigitizationFiles } from '@/hooks/useDigitization'

interface BatchUploadProps {
  onSelectForVerification: (itemId: string) => void
}

export default function BatchUpload({ onSelectForVerification }: BatchUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { data: queue = [] } = useDigitizationQueue()
  const uploadMutation = useUploadDigitizationFiles('batch')
  const progressMutation = useDigitizationProgress()
  const uploadedFiles = queue.filter((item) => item.status !== 'discarded')

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return

    const created = await uploadMutation.mutateAsync(files)
    for (const item of created) {
      await progressMutation.mutateAsync(item.id)
      await progressMutation.mutateAsync(item.id)
      await progressMutation.mutateAsync(item.id)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    void processFiles(files)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'text-success'
      case 'processing':
        return 'text-action'
      case 'pending':
        return 'text-text-muted'
      case 'failed':
        return 'text-urgency'
      default:
        return 'text-text-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle2 className="w-4 h-4" />
      case 'processing':
        return <Clock className="w-4 h-4 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const removeFile = (id: string) => {
    void onSelectForVerification(id)
  }

  return (
    <div className="space-y-6">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-action bg-action/5'
            : 'border-border hover:border-action/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            void processFiles(files)
            e.target.value = ''
          }}
        />
        <Upload className="w-8 h-8 mx-auto mb-3 text-text-muted" />
        <p className="text-text-primary font-mono font-semibold mb-1">
          Drag field survey files here or click to browse
        </p>
        <p className="text-text-muted text-sm">
          Supports PDF, JPEG, PNG files (up to 50 files at once)
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-mono font-semibold text-text-primary">
              Processing Queue ({uploadedFiles.length} files)
            </h3>
          </div>
          <div className="divide-y divide-border">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="px-6 py-4 hover:bg-base/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-mono text-text-primary font-semibold truncate">
                        {file.filename}
                      </p>
                      <span className={`flex items-center gap-1 text-sm ${getStatusColor(file.status)}`}>
                        {getStatusIcon(file.status)}
                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span>{file.pageCount} page{file.pageCount !== 1 ? 's' : ''}</span>
                      <span>
                        {file.uploadedAt.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(file.status === 'processed' || file.status === 'failed' || file.status === 'rescanned') && (
                      <button
                        onClick={() => onSelectForVerification(file.id)}
                        className="px-3 py-1 bg-action hover:bg-action/80 text-white rounded text-sm font-mono transition-colors"
                      >
                        Review
                      </button>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-base rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-text-muted hover:text-text-primary" />
                    </button>
                  </div>
                </div>

                {(file.status === 'processing' || file.status === 'uploading') && (
                  <div className="mt-3 h-1 bg-base rounded-full overflow-hidden">
                    <div
                      className="h-full bg-action animate-pulse"
                      style={{
                        width: `${file.progress}%`,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
