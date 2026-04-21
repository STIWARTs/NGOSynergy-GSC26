import { useEffect, useState } from 'react'
import { ScanLine } from 'lucide-react'
import BatchUpload from '@/components/digitization/BatchUpload'
import SingleDocument from '@/components/digitization/SingleDocument'
import HITLVerification from '@/components/digitization/HITLVerification'
import { useDigitizationQueue } from '@/hooks/useDigitization'

export default function DigitizationHub() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('batch')
  const [selectedItemForVerification, setSelectedItemForVerification] = useState<string | null>(null)
  const { data: queue = [] } = useDigitizationQueue()

  useEffect(() => {
    if (!selectedItemForVerification) return

    const exists = queue.some((item) => item.id === selectedItemForVerification && item.status !== 'discarded')
    if (!exists) {
      setSelectedItemForVerification(null)
    }
  }, [queue, selectedItemForVerification])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ScanLine className="w-8 h-8 text-action" />
        <h1 className="text-3xl font-mono font-semibold text-text-primary">Digitization Hub</h1>
      </div>

      {selectedItemForVerification ? (
        <HITLVerification
          itemId={selectedItemForVerification}
          onBack={() => setSelectedItemForVerification(null)}
        />
      ) : (
        <>
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-4 py-3 font-mono text-sm transition-colors ${
                activeTab === 'batch'
                  ? 'text-action border-b-2 border-action'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Batch Upload
            </button>
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-3 font-mono text-sm transition-colors ${
                activeTab === 'single'
                  ? 'text-action border-b-2 border-action'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Single Document
            </button>
          </div>

          {activeTab === 'batch' && (
            <BatchUpload onSelectForVerification={setSelectedItemForVerification} />
          )}
          {activeTab === 'single' && (
            <SingleDocument onSelectForVerification={setSelectedItemForVerification} />
          )}
        </>
      )}
    </div>
  )
}
