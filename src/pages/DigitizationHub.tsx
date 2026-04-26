import { useEffect, useState } from 'react'
import { ScanLine, Zap, Library } from 'lucide-react'
import BatchUpload from '@/components/digitization/BatchUpload'
import SingleDocument from '@/components/digitization/SingleDocument'
import HITLVerification from '@/components/digitization/HITLVerification'
import PipelineUpload from '@/components/digitization/PipelineUpload'
import DocumentsTable from '@/components/digitization/DocumentsTable'
import { useDigitizationQueue } from '@/hooks/useDigitization'
import * as Dialog from '@radix-ui/react-dialog'

export default function DigitizationHub() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'library' | 'single' | 'batch'>('pipeline')
  const [selectedItemForVerification, setSelectedItemForVerification] = useState<string | null>(null)
  const { data: queue = [] } = useDigitizationQueue()

  useEffect(() => {
    if (!selectedItemForVerification) return
    const exists = queue.some((item) => item.id === selectedItemForVerification && item.status !== 'discarded')
    if (!exists) setSelectedItemForVerification(null)
  }, [queue, selectedItemForVerification])

  const tabs: { id: typeof activeTab; label: string; icon?: any; badge?: string }[] = [
    { id: 'pipeline', label: 'Full Pipeline', icon: Zap, badge: 'NEW' },
    { id: 'library', label: 'Documents Library', icon: Library },
    { id: 'batch', label: 'Batch Upload' },
    { id: 'single', label: 'Single Document' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ScanLine className="w-8 h-8 text-action" />
        <div>
          <h1 className="text-3xl font-mono font-semibold text-text-primary">Digitization Hub</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Architecture: User Input → Document AI (OCR) → Preprocessing → Gemini JSON → Validate → Firestore + Storage → Chat
          </p>
        </div>
      </div>

      <Dialog.Root
        open={!!selectedItemForVerification}
        onOpenChange={(open) => !open && setSelectedItemForVerification(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-6xl bg-surface border-l border-border z-50 p-6 overflow-y-auto">
            {selectedItemForVerification && (
              <HITLVerification
                itemId={selectedItemForVerification}
                onBack={() => setSelectedItemForVerification(null)}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {!selectedItemForVerification && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-mono text-sm transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-action border-b-2 border-action'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {tab.label}
                  {tab.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-full font-sans font-semibold uppercase tracking-wider border border-indigo-500/40">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          {activeTab === 'pipeline' && <PipelineUpload />}
          {activeTab === 'library' && <DocumentsTable />}
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
