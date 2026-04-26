import { useMemo, useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useIncidents } from '@/hooks/useIncidents'
import { reportsService } from '@/api/reports'
import { incidentService } from '@/api/incidents'
import { queryKeys } from '@/lib/queryKeys'
import { Upload, X, FileText, Image, File, FolderOpen } from 'lucide-react'

export default function CrisisReports() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'pending' | 'resolved' | 'verified'>('all')
  const [category, setCategory] = useState('Flood')
  const [severity, setSeverity] = useState(3)
  const [reporterName, setReporterName] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [affectedCount, setAffectedCount] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [viewingDocuments, setViewingDocuments] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { data: incidents = [], isLoading } = useIncidents()

  const submitReport = useMutation({
    mutationFn: reportsService.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all })
      setReporterName('')
      setDescription('')
      setPhotoUrl('')
      setLat('')
      setLng('')
      setAffectedCount(0)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      incidentService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.active })
    },
  })

  const submitReportWithFile = useMutation({
    mutationFn: reportsService.submitWithFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all })
      setReporterName('')
      setDescription('')
      setPhotoUrl('')
      setLat('')
      setLng('')
      setAffectedCount(0)
      setSelectedFile(null)
    },
  })

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
    ]
    
    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload JPEG, PNG, GIF, WebP, PDF, or CSV files.')
      return
    }
    
    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB')
      return
    }
    
    setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleSubmit = () => {
    if (selectedFile) {
      submitReportWithFile.mutate({
        category,
        severity,
        coordinates: { lat: Number(lat), lng: Number(lng) },
        file: selectedFile,
        photoUrl: photoUrl || undefined,
        reporterName: reporterName || undefined,
        description: description || undefined,
        affectedCount,
      })
    } else {
      submitReport.mutate({
        category,
        severity,
        coordinates: { lat: Number(lat), lng: Number(lng) },
        photoUrl,
        reporterName: reporterName || undefined,
        description: description || undefined,
        affectedCount,
      })
    }
  }

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        incident.title.toLowerCase().includes(query.toLowerCase()) ||
        incident.location.toLowerCase().includes(query.toLowerCase()) ||
        incident.category.toLowerCase().includes(query.toLowerCase())

      const matchesStatus = status === 'all' ? true : incident.status === status
      return matchesSearch && matchesStatus
    })
  }, [incidents, query, status])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-mono font-semibold text-text-primary">Crisis Reports</h1>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Submit New Crisis Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            placeholder="Reporter name"
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          >
            <option>Flood</option>
            <option>Earthquake</option>
            <option>Fire</option>
            <option>Landslide</option>
            <option>Medical Emergency</option>
          </select>
          <input
            type="number"
            min={1}
            max={5}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
            placeholder="Severity (1-5)"
          />
          <input
            type="number"
            min={0}
            value={affectedCount}
            onChange={(e) => setAffectedCount(Number(e.target.value))}
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
            placeholder="Affected count"
          />
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Longitude"
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
        </div>

        {/* File Upload Area */}
        <div>
          <label className="block text-xs text-text-muted mb-2 font-medium">
            Attach File (PDF, Image, or CSV)
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-indigo-400 bg-indigo-500/10'
                : selectedFile
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-border hover:border-indigo-500/50 hover:bg-indigo-500/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {selectedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  {selectedFile.type.includes('image') ? (
                    <Image className="w-8 h-8 text-green-400" />
                  ) : selectedFile.type === 'application/pdf' ? (
                    <FileText className="w-8 h-8 text-green-400" />
                  ) : (
                    <File className="w-8 h-8 text-green-400" />
                  )}
                </div>
                <p className="text-sm font-medium text-green-400">{selectedFile.name}</p>
                <p className="text-xs text-text-muted">
                  {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 mx-auto"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-10 h-10 text-text-muted mx-auto opacity-40" />
                <p className="text-sm text-text-primary font-medium">Drop file or click to browse</p>
                <p className="text-xs text-text-muted">Supports PDF, JPG, PNG, GIF, WebP, CSV (max 20MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Photo URL (optional if file uploaded) */}
        <input
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="Public photo URL (optional if file attached)"
          className="w-full bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
        />
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Incident description"
          className="w-full bg-base border border-border rounded px-3 py-2 text-sm text-text-primary min-h-24"
        />
        <button
          onClick={handleSubmit}
          disabled={
            submitReport.isPending ||
            submitReportWithFile.isPending ||
            (!selectedFile && !photoUrl) ||
            !description ||
            !lat ||
            !lng ||
            Number.isNaN(Number(lat)) ||
            Number.isNaN(Number(lng))
          }
          className="px-4 py-2 rounded bg-action text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitReport.isPending || submitReportWithFile.isPending ? 'Submitting...' : 'Submit Report'}
        </button>
        {(submitReport.isError || submitReportWithFile.isError) && (
          <p className="text-xs text-red-500">Failed to submit report. Please check fields and try again.</p>
        )}
        {(submitReport.isSuccess || submitReportWithFile.isSuccess) && (
          <p className="text-xs text-green-500">
            Report submitted. Incident ID: {submitReport.data?.incidentId || submitReportWithFile.data?.incidentId}
          </p>
        )}
      </div>

      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, category, or location"
            className="flex-1 bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'pending' | 'resolved' | 'verified')}
            className="bg-base border border-border rounded px-3 py-2 text-sm text-text-primary"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border text-xs text-text-muted font-mono items-center">
          <span className="col-span-3">Incident</span>
          <span className="col-span-2">Category</span>
          <span className="col-span-1 text-center">Urgency</span>
          <span className="col-span-1 text-center">Status</span>
          <span className="col-span-1 text-center">Affected</span>
          <span className="col-span-2 text-center">Update</span>
          <span className="col-span-2 flex justify-end">Documents</span>
        </div>
        {!isLoading && filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border last:border-b-0 text-sm items-center"
          >
            <div className="col-span-3">
              <p className="text-text-primary font-medium truncate" title={incident.title}>{incident.title}</p>
              <p className="text-text-muted text-xs truncate" title={incident.location}>{incident.location}</p>
            </div>
            <span className="col-span-2 text-text-primary truncate" title={incident.category}>{incident.category}</span>
            <span className="col-span-1 text-text-primary text-center">{incident.urgencyScore}</span>
            <span className="col-span-1 text-center">
              <span className="px-1.5 py-0.5 rounded bg-base border border-border text-text-primary text-[10px] whitespace-nowrap">
                {incident.status}
              </span>
            </span>
            <span className="col-span-1 text-text-primary text-center">{incident.affectedCount}</span>
            <span className="col-span-2 flex justify-center">
              <select
                value={incident.status}
                onChange={(e) => updateStatusMutation.mutate({ id: incident.id, status: e.target.value })}
                disabled={updateStatusMutation.isPending}
                className="px-2 py-1 rounded bg-surface border border-border text-text-primary text-xs w-full max-w-[100px] focus:outline-none focus:border-indigo-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="verified">Verified</option>
                <option value="resolved">Resolved</option>
              </select>
            </span>
            <span className="col-span-2 flex justify-end">
              <button
                onClick={() => setViewingDocuments(incident.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium transition-all"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">View Docs</span>
              </button>
            </span>
          </div>
        ))}
        {isLoading && (
          <p className="p-6 text-sm text-text-muted text-center">Loading incidents...</p>
        )}
        {filteredIncidents.length === 0 && (
          <p className="p-6 text-sm text-text-muted text-center">No incidents match your filters.</p>
        )}
      </div>

      {/* Documents Modal */}
      {viewingDocuments && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Attached Documents</h3>
                <p className="text-xs text-text-muted mt-1">
                  Incident ID: {viewingDocuments}
                </p>
              </div>
              <button
                onClick={() => setViewingDocuments(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              {(() => {
                const incident = incidents.find(inc => inc.id === viewingDocuments)
                const hasFile = incident?.fileName
                
                if (!hasFile) {
                  return (
                    <div className="text-center py-12">
                      <FolderOpen className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
                      <p className="text-sm text-text-muted font-medium">No documents attached</p>
                      <p className="text-xs text-text-muted mt-2 opacity-60">
                        Documents uploaded with this report will appear here
                      </p>
                    </div>
                  )
                }

                return (
                  <div className="border border-border rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-base border-b border-border text-xs text-text-muted font-mono">
                      <span className="col-span-1">#</span>
                      <span className="col-span-1">Type</span>
                      <span className="col-span-5">File Name</span>
                      <span className="col-span-3">File Type</span>
                      <span className="col-span-2">Action</span>
                    </div>
                    
                    {/* Table Body */}
                    <div className="divide-y divide-border">
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm hover:bg-white/5 transition-colors">
                        <span className="col-span-1 text-text-muted">1</span>
                        <span className="col-span-1">
                          {incident?.fileType?.includes('image') ? (
                            <Image className="w-5 h-5 text-indigo-400" />
                          ) : incident?.fileType === 'application/pdf' ? (
                            <FileText className="w-5 h-5 text-red-400" />
                          ) : (
                            <File className="w-5 h-5 text-green-400" />
                          )}
                        </span>
                        <span className="col-span-5 text-text-primary font-medium truncate">
                          {incident?.fileName}
                        </span>
                        <span className="col-span-3 text-text-muted text-xs">
                          {incident?.fileType || 'Unknown'}
                        </span>
                        <span className="col-span-2">
                          <button className="px-3 py-1.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium transition-all">
                            Download
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setViewingDocuments(null)}
                className="px-4 py-2 rounded bg-base border border-border text-text-primary text-sm hover:bg-white/5 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
