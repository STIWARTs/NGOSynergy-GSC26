/**
 * Digitization Route — Full Data Digitization Pipeline
 * Architecture: User Input → Document AI (OCR) → Preprocessing → Gemini JSON → Validate → Firestore
 */

import { Router, Request, Response } from 'express'
import multer from 'multer'
import { pipelineService } from '../services/pipelineService.js'
import { documentAiService } from '../services/documentAiService.js'
import { firebaseService } from '../services/firebaseService.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'

const router = Router()

// Multer config: accept images + PDFs, max 20MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/tiff', 'application/pdf']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Use JPEG, PNG, TIFF, or PDF.`))
    }
  },
})

/**
 * POST /api/digitization/process
 * 🔑 MAIN PIPELINE ENDPOINT
 * Full architecture: File Upload → OCR → Preprocess → Gemini JSON → Validate → Priority Score → Firestore
 *
 * Accepts either:
 *   - multipart/form-data with `file` field (PDF/image upload)
 *   - application/json with `text` field (raw text, skips OCR)
 */
router.post('/process', authMiddleware, adminOnly, upload.single('file'), async (req: Request, res: Response) => {
  try {
    let result

    if (req.file) {
      // --- File Upload Path: Full Pipeline (OCR → Preprocess → Gemini → Validate → Store) ---
      console.log(`[Digitization] Processing file: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`)

      result = await pipelineService.processDocument(
        req.file.buffer,
        req.file.originalname
      )
    } else if (req.body?.text) {
      // --- Text Path: Skip OCR, run Preprocess → Gemini → Validate → Store ---
      console.log('[Digitization] Processing raw text input')
      result = await pipelineService.processText(req.body.text)
    } else {
      return res.status(400).json({
        error: 'Provide either a file (multipart/form-data) or text (application/json { "text": "..." })',
      })
    }

    res.json({
      success: true,
      id: result.id,
      crisis: result.data,
      pipelineMetadata: result.pipelineMetadata,
      timestamp: new Date().toISOString(),
      message: `Pipeline complete. Crisis stored with Priority Score: ${result.data.priorityScore}`,
    })
  } catch (error: any) {
    console.error('[Digitization] Pipeline failed:', error.message)
    res.status(500).json({
      error: error.message || 'Pipeline processing failed',
      step: error.step || 'unknown',
    })
  }
})

/**
 * POST /api/digitization/upload  (legacy — simple Document AI extraction, no full pipeline)
 * Kept for backward compatibility with existing SingleDocument/BatchUpload components
 */
router.post('/upload', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { imageUrl, filename } = req.body

    if (!imageUrl || !filename) {
      return res.status(400).json({ error: 'Missing imageUrl or filename' })
    }

    const extractedData = await documentAiService.processDocument(imageUrl)

    res.json({
      success: true,
      filename,
      extractedData,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Digitization error:', error)
    res.status(500).json({ error: error.message || 'Digitization failed' })
  }
})

/**
 * GET /api/digitization/queue
 * Returns items pending human-in-the-loop verification
 */
router.get('/queue', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const items = await firebaseService.getDigitizationQueue()
    res.json({
      items,
      total: items.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Queue fetch error:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch digitization queue' })
  }
})

/**
 * POST /api/digitization/commit
 * Commit a digitized document as a confirmed incident (HITL approval flow)
 */
router.post('/commit', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { extractedData } = req.body

    if (!extractedData) {
      return res.status(400).json({ error: 'Missing extractedData' })
    }

    const incidentId = await firebaseService.createIncident({
      category: extractedData.category || extractedData.incidentType || 'Unknown',
      severity: extractedData.severity ? parseInt(extractedData.severity) : 3,
      reporterName: extractedData.reporterName || 'Field Report',
      description: extractedData.description || extractedData.summary || '',
      affectedCount: extractedData.people_affected || extractedData.affectedCount
        ? parseInt(extractedData.people_affected || extractedData.affectedCount)
        : 0,
      location: extractedData.location_name || extractedData.location || '',
      coordinates: { lat: 0, lng: 0 },
      photoUrl: '',
      urgencyScore: extractedData.priorityScore ? Math.round(extractedData.priorityScore * 10) : 50,
      verified: true,
      geminiVerified: true,
      title: `${extractedData.category || extractedData.incidentType || 'Report'} — Digitized`,
      timestamp: new Date().toISOString(),
    })

    res.json({
      success: true,
      incidentId,
      message: 'Document committed as verified incident',
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to commit document' })
  }
})

export default router
