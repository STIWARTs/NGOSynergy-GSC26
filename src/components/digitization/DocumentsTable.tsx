/**
 * DocumentsTable — Library of all processed/digitized documents
 * Shows each document as a table row with key metadata and an "Open" button
 * that launches the split-panel DocumentViewer.
 */

import { useState, useEffect } from 'react'
import {
  FileText, Droplets, Heart, Home, LifeBuoy, Activity,
  ChevronRight, RefreshCw, AlertCircle, Clock, Users,
  MapPin, TrendingUp, MessageSquare, Loader2
} from 'lucide-react'
import { documentsApi, DigiDocument } from '@/api/documents'
import DocumentViewer from './DocumentViewer'

const CATEGORY_ICONS: Record<string, any> = {
  Water: Droplets, Health: Heart, Shelter: Home, Rescue: LifeBuoy, Food: Activity,
}

const CATEGORY_COLORS: Record<string, string> = {
  Water: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  Health: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  Shelter: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  Rescue: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Food: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
}

const URGENCY_COLORS: Record<string, string> = {
  HIGH: 'text-red-400 bg-red-500/10 border-red-500/30',
  MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  LOW: 'text-green-400 bg-green-500/10 border-green-500/30',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function DocumentsTable() {
  const [documents, setDocuments] = useState<DigiDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<DigiDocument | null>(null)

  async function loadDocuments() {
    setLoading(true)
    setError(null)
    try {
      const docs = await documentsApi.listDocuments()
      setDocuments(docs)
    } catch (err: any) {
      setError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  if (selectedDoc) {
    return (
      <div className="fixed left-60 top-16 right-0 bottom-0 z-30 bg-surface overflow-hidden">
        <DocumentViewer
          document={selectedDoc}
          onBack={() => setSelectedDoc(null)}
          fullScreen
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary font-mono">
            Digitized Documents Library
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {documents.length} document{documents.length !== 1 ? 's' : ''} processed through the pipeline
          </p>
        </div>
        <button
          onClick={loadDocuments}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-muted hover:text-text-primary border border-border hover:border-white/20 rounded-lg transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-text-muted">Loading documents...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">Failed to load documents</p>
            <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
          </div>
          <button
            onClick={loadDocuments}
            className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-indigo-400 opacity-60" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-2">No Documents Yet</h3>
          <p className="text-sm text-text-muted max-w-xs leading-relaxed">
            Run the Full Pipeline on a PDF or image above. Processed documents will appear here with their AI chat interface.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-indigo-400">
            <ChevronRight className="w-3.5 h-3.5" />
            Switch to the "Full Pipeline" tab to upload a document
          </div>
        </div>
      )}

      {/* Documents table */}
      {!loading && !error && documents.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border bg-white/[0.02]">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Document</span>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Category</span>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Location</span>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Affected</span>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Priority</span>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Action</span>
          </div>

          {/* Table rows */}
          {documents.map((doc, i) => {
            const CatIcon = CATEGORY_ICONS[doc.category] || Activity
            const catColor = CATEGORY_COLORS[doc.category] || 'text-blue-400 bg-blue-500/10 border-blue-500/30'
            const urgColor = URGENCY_COLORS[doc.urgency] || 'text-text-muted bg-white/5 border-border'
            const score = doc.priorityScore || 0
            const scoreColor = score >= 8 ? 'text-red-400' : score >= 6 ? 'text-amber-400' : 'text-green-400'

            return (
              <div
                key={doc.id}
                className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors cursor-pointer group ${i < documents.length - 1 ? 'border-b border-border' : ''}`}
                onClick={() => setSelectedDoc(doc)}
              >
                {/* Document name + meta */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <p className="text-sm font-medium text-text-primary truncate group-hover:text-indigo-300 transition-colors">
                      {doc.filename}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pl-9">
                    <span className="flex items-center gap-1 text-[11px] text-text-muted">
                      <Clock className="w-3 h-3" />
                      {timeAgo(doc.uploadedAt)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-text-muted">
                      <TrendingUp className="w-3 h-3" />
                      {doc.processingTimeMs}ms
                    </span>
                    <span className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border ${urgColor}`}>
                      {doc.urgency}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium ${catColor}`}>
                    <CatIcon className="w-3.5 h-3.5" />
                    {doc.category}
                  </span>
                  <p className="text-[10px] text-text-muted mt-1.5">Severity {doc.severity}/10</p>
                </div>

                {/* Location */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs text-text-primary">
                    <MapPin className="w-3 h-3 text-text-muted flex-shrink-0" />
                    <span className="truncate">{doc.location_name}</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">OCR {(doc.ocrConfidence * 100).toFixed(0)}% conf.</p>
                </div>

                {/* People affected */}
                <div>
                  <div className="flex items-center gap-1 text-xs text-text-primary">
                    <Users className="w-3 h-3 text-text-muted" />
                    <span className="font-semibold">{(doc.people_affected || 0).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">people</p>
                </div>

                {/* Priority score */}
                <div>
                  <p className={`text-xl font-bold font-mono ${scoreColor}`}>{score.toFixed(1)}</p>
                  <p className="text-[10px] text-text-muted">/ 10</p>
                </div>

                {/* Open button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 text-xs font-medium rounded-lg border border-indigo-500/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Open Chat
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
