/**
 * DocumentViewer — Split-panel component
 * Left panel:  PDF viewer (iframe / object embed using signed URL)
 * Right panel: Persistent Gemini AI chat about the document
 *
 * Chat history is loaded from backend on open and persisted on every message.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ArrowLeft, FileText, MessageSquare, Send, Loader2, Bot, User,
  AlertCircle, Droplets, Heart, Home, LifeBuoy, Activity,
  Clock, Users, MapPin, TrendingUp, RefreshCw, Maximize2, Minimize2,
  Sparkles, ChevronDown, Copy, Check
} from 'lucide-react'
import { documentsApi, DigiDocument, ChatMessage } from '@/api/documents'

// ─── Icons / colors ────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, any> = {
  Water: Droplets, Health: Heart, Shelter: Home, Rescue: LifeBuoy, Food: Activity,
}

const CATEGORY_COLORS: Record<string, string> = {
  Water: 'text-blue-400', Health: 'text-rose-400',
  Shelter: 'text-purple-400', Rescue: 'text-orange-400', Food: 'text-amber-400',
}

const URGENCY_COLORS: Record<string, string> = {
  HIGH: 'text-red-400 bg-red-500/10 border-red-500/30',
  MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  LOW: 'text-green-400 bg-green-500/10 border-green-500/30',
}

const SUGGESTED_QUESTIONS = [
  'Give me a full summary of this document',
  'How many people are affected and where?',
  'What immediate actions should we take?',
  'What is the severity and urgency level?',
  'What resources does this crisis require?',
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── ChatBubble ────────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`flex gap-2.5 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser
          ? 'bg-indigo-500/20 border border-indigo-500/30'
          : 'bg-violet-500/20 border border-violet-500/30'
      }`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-indigo-400" />
          : <Bot className="w-3.5 h-3.5 text-violet-400" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[82%] group/bubble`}>
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-indigo-500/20 text-indigo-50 border border-indigo-500/20 rounded-tr-sm'
            : 'bg-white/[0.06] text-text-primary border border-white/[0.08] rounded-tl-sm'
        }`}>
          {msg.content}
        </div>
        <div className={`flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'justify-end' : ''}`}>
          <span className="text-[10px] text-text-muted">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button onClick={copy} className="text-text-muted hover:text-text-primary transition-colors">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PDF Panel ─────────────────────────────────────────────────────────────────

function PdfPanel({ doc }: { doc: DigiDocument }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState(true)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setLoadingUrl(true)
    setPdfError(null)
    // Try stored URL first, fall back to signing
    if (doc.storageUrl && doc.storageUrl.startsWith('http')) {
      setPdfUrl(doc.storageUrl)
      setLoadingUrl(false)
    } else {
      documentsApi.getSignedUrl(doc.id)
        .then((url) => { setPdfUrl(url); setLoadingUrl(false) })
        .catch((err) => { setPdfError(err.message); setLoadingUrl(false) })
    }
  }, [doc.id])

  return (
    <div className={`flex flex-col h-full border-r border-border transition-all ${expanded ? 'w-full' : ''}`}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white/[0.02] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="text-sm font-medium text-text-primary truncate">{doc.filename}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
        >
          {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Document metadata strip */}
      <div className="flex gap-4 px-4 py-2.5 border-b border-border bg-white/[0.01] flex-shrink-0 flex-wrap">
        <MetaBadge icon={MapPin} label={doc.location_name} />
        <MetaBadge icon={Users} label={`${(doc.people_affected || 0).toLocaleString()} affected`} />
        <MetaBadge icon={TrendingUp} label={`Priority ${doc.priorityScore?.toFixed(1)}`} />
        <MetaBadge icon={Clock} label={timeAgo(doc.uploadedAt)} />
      </div>

      {/* PDF viewer */}
      <div className="flex-1 relative overflow-hidden bg-neutral-900">
        {loadingUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm text-text-muted">Loading document...</p>
            </div>
          </div>
        )}

        {pdfError && !loadingUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
            <p className="text-sm font-medium text-text-primary mb-1">PDF preview unavailable</p>
            <p className="text-xs text-text-muted mb-4 max-w-xs">
              Firebase Storage URL could not be loaded. This may be because storage is not configured, or the signed URL has expired.
            </p>
            <div className="bg-white/5 border border-border rounded-lg p-3 w-full max-w-sm text-left">
              <p className="text-[10px] text-text-muted font-mono mb-1">Stored path:</p>
              <p className="text-[11px] text-text-primary font-mono break-all">{doc.storagePath}</p>
            </div>
            <div className="mt-4 bg-white/5 border border-border rounded-lg p-3 w-full max-w-sm text-left">
              <p className="text-xs text-text-muted mb-2 font-medium">Extracted OCR text preview:</p>
              <p className="text-xs text-text-primary leading-relaxed line-clamp-6">{doc.ocrText}</p>
            </div>
          </div>
        )}

        {pdfUrl && !loadingUrl && !pdfError && (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={doc.filename}
            onError={() => setPdfError('PDF could not be rendered')}
          />
        )}
      </div>
    </div>
  )
}

function MetaBadge({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px] text-text-muted">
      <Icon className="w-3 h-3" />
      <span className="truncate max-w-[120px]">{label}</span>
    </span>
  )
}

// ─── Chat Panel ────────────────────────────────────────────────────────────────

function ChatPanel({ doc }: { doc: DigiDocument }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [initialSummarizing, setInitialSummarizing] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  // Load history on mount
  useEffect(() => {
    setLoadingHistory(true)
    documentsApi.getChatHistory(doc.id)
      .then((history) => {
        setMessages(history)
        if (history.length === 0) {
          // Auto-generate an opening summary
          setInitialSummarizing(true)
          documentsApi.getSummary(doc.id)
            .then((summary) => {
              const welcomeMsg: ChatMessage = {
                id: `welcome-${Date.now()}`,
                role: 'assistant',
                content: summary,
                timestamp: new Date().toISOString(),
              }
              setMessages([welcomeMsg])
              setShowSuggestions(true)
            })
            .catch(() => {
              // Still show chat without summary
            })
            .finally(() => setInitialSummarizing(false))
        } else {
          setShowSuggestions(false)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingHistory(false))
  }, [doc.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages, initialSummarizing])

  async function sendMessage(text?: string) {
    const msg = (text || input).trim()
    if (!msg || sending) return

    setInput('')
    setShowSuggestions(false)
    setError(null)
    setSending(true)

    // Optimistic user message
    const optimisticUser: ChatMessage = {
      id: `opt-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticUser])
    scrollToBottom()

    try {
      const { assistantMessage } = await documentsApi.sendMessage(doc.id, msg)
      // Replace optimistic with confirmed user msg + add assistant
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== optimisticUser.id)
        return [
          ...without,
          { ...optimisticUser, id: `user-${Date.now()}` },
          assistantMessage,
        ]
      })
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id))
    } finally {
      setSending(false)
      scrollToBottom()
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const CatIcon = CATEGORY_ICONS[doc.category] || Activity

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-border bg-white/[0.02] flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-text-primary">Document AI Assistant</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 pl-8">
          <CatIcon className={`w-3 h-3 ${CATEGORY_COLORS[doc.category] || 'text-blue-400'}`} />
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${URGENCY_COLORS[doc.urgency] || ''}`}>
            {doc.urgency}
          </span>
          <span className="text-[10px] text-text-muted">Severity {doc.severity}/10</span>
          <span className="text-[10px] text-text-muted">·</span>
          <span className="text-[10px] text-text-muted">History saved</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingHistory && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
        )}

        {initialSummarizing && messages.length === 0 && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="px-3.5 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                <span>Analyzing document...</span>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}

        {sending && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="px-3.5 py-3 bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Suggested questions */}
        {showSuggestions && messages.length <= 1 && !sending && !loadingHistory && (
          <div className="space-y-2">
            <p className="text-[11px] text-text-muted flex items-center gap-1.5">
              <ChevronDown className="w-3 h-3" />
              Suggested questions
            </p>
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="w-full text-left text-xs text-text-muted hover:text-text-primary bg-white/[0.03] hover:bg-white/[0.06] border border-border hover:border-white/20 rounded-lg px-3 py-2 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-3 flex-shrink-0 bg-white/[0.01]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this document..."
            rows={1}
            className="flex-1 bg-white/[0.05] border border-border focus:border-indigo-500/60 rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none transition-colors leading-relaxed max-h-32 overflow-y-auto"
            style={{ minHeight: '40px' }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`
            }}
            disabled={sending || loadingHistory}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || sending || loadingHistory}
            className="w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-text-muted mt-2 px-1">
          Press Enter to send · Shift+Enter for new line · Chat history is saved automatically
        </p>
      </div>
    </div>
  )
}

// ─── Main DocumentViewer ───────────────────────────────────────────────────────

interface Props {
  document: DigiDocument
  onBack: () => void
}

export default function DocumentViewer({ document: doc, onBack }: Props) {
  const CatIcon = CATEGORY_ICONS[doc.category] || Activity

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Documents Library
        </button>

        <div className="flex items-center gap-3">
          <CatIcon className={`w-4 h-4 ${CATEGORY_COLORS[doc.category] || 'text-blue-400'}`} />
          <span className="text-sm font-medium text-text-primary">{doc.filename}</span>
          <span className={`text-xs px-2 py-0.5 rounded border ${URGENCY_COLORS[doc.urgency] || ''}`}>
            {doc.urgency}
          </span>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 grid grid-cols-2 bg-surface border border-border rounded-xl overflow-hidden min-h-0">
        {/* Left: PDF */}
        <PdfPanel doc={doc} />

        {/* Right: Chat */}
        <ChatPanel doc={doc} />
      </div>
    </div>
  )
}
