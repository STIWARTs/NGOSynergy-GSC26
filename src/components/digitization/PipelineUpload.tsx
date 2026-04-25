/**
 * PipelineUpload — Full Data Digitization Pipeline UI
 * Visualizes: User Input → OCR → Preprocessing → Gemini AI → Validate → Firestore
 */

import { useState, useRef, useCallback } from 'react'
import { usePipelineProcess, usePipelineProcessText } from '@/hooks/useCrises'
import {
  Upload, FileText, Brain, CheckCircle2, Database, AlertCircle, Loader2,
  Zap, ChevronRight, Eye, Droplets, Heart, Home, LifeBuoy, Activity, X
} from 'lucide-react'

// ─── Pipeline step definitions ────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { id: 'upload', label: 'User Input', icon: Upload, color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Document/Image upload' },
  { id: 'ocr', label: 'Document AI (OCR)', icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10', desc: 'Text extraction' },
  { id: 'preprocess', label: 'Preprocessing', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', desc: 'Clean & normalize' },
  { id: 'gemini', label: 'Gemini AI', icon: Brain, color: 'text-green-400', bg: 'bg-green-500/10', desc: 'JSON extraction' },
  { id: 'validate', label: 'Validation', icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/10', desc: 'Zod schema check' },
  { id: 'firestore', label: 'Firestore', icon: Database, color: 'text-rose-400', bg: 'bg-rose-500/10', desc: 'Priority storage' },
]

type StepStatus = 'idle' | 'active' | 'done' | 'error'

const CATEGORY_ICONS: Record<string, any> = {
  Water: Droplets, Health: Heart, Shelter: Home, Rescue: LifeBuoy, Food: Activity,
}

const CATEGORY_COLOR: Record<string, string> = {
  Water: 'text-blue-400', Health: 'text-rose-400', Shelter: 'text-purple-400',
  Rescue: 'text-orange-400', Food: 'text-amber-400',
}

const URGENCY_COLOR: Record<string, string> = {
  HIGH: 'text-red-400 bg-red-500/10 border-red-500/30',
  MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  LOW: 'text-green-400 bg-green-500/10 border-green-500/30',
}

// ─── Component ────────────────────────────────────────────────────────────────

type InputMode = 'file' | 'text'

export default function PipelineUpload() {
  const [inputMode, setInputMode] = useState<InputMode>('file')
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [rawText, setRawText] = useState('')
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({})
  const [result, setResult] = useState<any | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pipelineFile = usePipelineProcess()
  const pipelineText = usePipelineProcessText()
  const isRunning = pipelineFile.isPending || pipelineText.isPending

  // Animate through pipeline steps
  function simulatePipelineAnimation(resolveAfterMs = 4000) {
    const stepIds = PIPELINE_STEPS.map((s) => s.id)
    const delay = Math.floor(resolveAfterMs / (stepIds.length + 1))
    stepIds.forEach((id, i) => {
      setTimeout(() => {
        setStepStatuses((prev) => {
          const next = { ...prev }
          if (i > 0) next[stepIds[i - 1]] = 'done'
          next[id] = 'active'
          return next
        })
      }, i * delay)
    })
    return delay
  }

  function finalizePipeline(success: boolean) {
    const stepIds = PIPELINE_STEPS.map((s) => s.id)
    setStepStatuses(() => {
      const next: Record<string, StepStatus> = {}
      stepIds.forEach((id) => { next[id] = success ? 'done' : 'error' })
      return next
    })
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) setSelectedFile(file)
  }, [])

  async function runPipeline() {
    setResult(null)
    setErrorMsg(null)
    setStepStatuses({ upload: 'done' })
    simulatePipelineAnimation(5000)

    try {
      let res
      if (inputMode === 'file' && selectedFile) {
        res = await pipelineFile.mutateAsync({ file: selectedFile })
      } else if (inputMode === 'text' && rawText.trim()) {
        res = await pipelineText.mutateAsync(rawText.trim())
      } else {
        setErrorMsg(inputMode === 'file' ? 'Please select a file first.' : 'Please enter some text.')
        setStepStatuses({})
        return
      }
      finalizePipeline(true)
      setResult(res)
    } catch (err: any) {
      finalizePipeline(false)
      setErrorMsg(err.message || 'Pipeline failed')
    }
  }

  function reset() {
    setResult(null)
    setErrorMsg(null)
    setStepStatuses({})
    setSelectedFile(null)
    setRawText('')
  }

  const CatIcon = result?.crisis?.category ? (CATEGORY_ICONS[result.crisis.category] || Activity) : Activity

  return (
    <div className="space-y-6">
      {/* Architecture flow visualization */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <p className="text-xs text-text-muted mb-3 font-mono uppercase tracking-wider">Pipeline Architecture</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon
            const status = stepStatuses[step.id] || 'idle'
            return (
              <div key={step.id} className="flex items-center gap-1.5">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-300 ${
                    status === 'done' ? 'border-green-500/50 bg-green-500/10' :
                    status === 'active' ? 'border-indigo-500/70 bg-indigo-500/15 shadow-lg shadow-indigo-500/10 scale-105' :
                    status === 'error' ? 'border-red-500/50 bg-red-500/10' :
                    `${step.bg} border-white/10 opacity-60`
                  }`}
                >
                  {status === 'active' ? (
                    <Loader2 className={`w-3.5 h-3.5 animate-spin ${step.color}`} />
                  ) : status === 'done' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  ) : status === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${step.color}`} />
                  )}
                  <span className={`text-[11px] font-medium ${
                    status === 'done' ? 'text-green-400' :
                    status === 'active' ? 'text-indigo-300' :
                    status === 'error' ? 'text-red-400' :
                    'text-text-muted'
                  }`}>{step.label}</span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-text-muted opacity-30 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Input mode toggle */}
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          onClick={() => setInputMode('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            inputMode === 'file'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <FileText className="w-4 h-4" />
          File Upload (OCR)
        </button>
        <button
          onClick={() => setInputMode('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            inputMode === 'text'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Brain className="w-4 h-4" />
          Raw Text (skip OCR)
        </button>
      </div>

      {/* File Upload Area */}
      {inputMode === 'file' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
              : selectedFile
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-border hover:border-indigo-500/50 hover:bg-indigo-500/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/tiff,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
          />
          {selectedFile ? (
            <div className="space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
              <p className="text-sm font-medium text-green-400">{selectedFile.name}</p>
              <p className="text-xs text-text-muted">
                {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                className="text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 text-text-muted mx-auto opacity-40" />
              <p className="text-sm text-text-primary font-medium">Drop file or click to browse</p>
              <p className="text-xs text-text-muted">Supports JPEG, PNG, TIFF, PDF (max 20MB)</p>
            </div>
          )}
        </div>
      )}

      {/* Text Input Area */}
      {inputMode === 'text' && (
        <div>
          <label className="block text-xs text-text-muted mb-2 font-medium">
            Field Report / Crisis Description
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={6}
            placeholder="e.g., Severe water shortage in Village A, Sector 3. Approximately 450 people without safe drinking water for 3 days. Children and elderly at risk. Need immediate water tanker supply..."
            className="w-full bg-base border border-border rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-indigo-500/60 transition-colors leading-relaxed"
          />
          <p className="text-xs text-text-muted mt-1">{rawText.length} characters</p>
        </div>
      )}

      {/* Run button */}
      <button
        onClick={runPipeline}
        disabled={isRunning || (inputMode === 'file' && !selectedFile) || (inputMode === 'text' && !rawText.trim())}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
          isRunning
            ? 'bg-indigo-500/40 text-indigo-300 cursor-wait'
            : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.99]'
        } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100`}
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Running Pipeline...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Run Data Digitization Pipeline
          </>
        )}
      </button>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Pipeline Failed</p>
            <p className="text-xs text-red-400/70 mt-1">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-400/70 hover:text-red-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="border border-green-500/30 bg-green-500/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-green-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Pipeline Complete</span>
            </div>
            <button onClick={reset} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-4">
            {/* Crisis data */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CatIcon className={`w-5 h-5 ${CATEGORY_COLOR[result.crisis?.category] || 'text-blue-400'}`} />
                <span className="text-sm font-semibold text-text-primary">{result.crisis?.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${URGENCY_COLOR[result.crisis?.urgency] || ''}`}>
                  {result.crisis?.urgency}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-text-muted">Severity</p>
                  <p className="text-text-primary font-semibold text-sm">{result.crisis?.severity}/10</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-text-muted">Affected</p>
                  <p className="text-text-primary font-semibold text-sm">{(result.crisis?.people_affected || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 col-span-2">
                  <p className="text-text-muted">Location</p>
                  <p className="text-text-primary font-medium">{result.crisis?.location_name}</p>
                </div>
              </div>
            </div>

            {/* Priority score */}
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Priority Score</p>
                <p className="text-3xl font-bold text-indigo-400">
                  {result.crisis?.priorityScore?.toFixed(2)}
                </p>
                <p className="text-[10px] text-text-muted mt-1 font-mono">/ ~10.0 max</p>
              </div>
              {result.pipelineMetadata && (
                <div className="text-xs space-y-1 text-text-muted">
                  <p>⏱ {result.pipelineMetadata.processingTimeMs}ms</p>
                  <p>📄 {result.pipelineMetadata.textLength} chars extracted</p>
                  <p>🎯 OCR confidence: {(result.pipelineMetadata.ocrConfidence * 100).toFixed(0)}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="px-4 pb-4">
            <p className="text-xs text-text-muted mb-1">AI Summary</p>
            <p className="text-xs text-text-primary leading-relaxed bg-white/5 rounded-lg p-2">
              {result.crisis?.summary}
            </p>
            <p className="text-[10px] text-text-muted mt-2">
              Saved to Firestore → Collection: <code className="font-mono text-indigo-400">crises</code> · ID: <code className="font-mono text-green-400">{result.id}</code>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
