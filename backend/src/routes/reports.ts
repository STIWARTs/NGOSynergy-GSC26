import { Router, Request, Response } from 'express'
import multer from 'multer'
import { geminiService } from '../services/geminiService.js'
import { documentAiService } from '../services/documentAiService.js'
import { firebaseService } from '../services/firebaseService.js'
import { ReportSubmissionSchema } from '../schemas/index.js'

const router = Router()

// Multer config: accept images, PDFs, and CSVs, max 20MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Use JPEG, PNG, GIF, WebP, PDF, or CSV.`))
    }
  },
})

// Public endpoint: Submit crisis report with photo verification
router.post('/submit', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let photoUrl = req.body?.photoUrl || ''
    let fileName = ''
    let fileData: Buffer | null = null

    // Handle file upload if present
    if (req.file) {
      fileName = req.file.originalname
      fileData = req.file.buffer
      console.log(`[Reports] Processing file upload: ${fileName} (${req.file.mimetype}, ${req.file.size} bytes)`)
      
      // In a production environment, you would upload to cloud storage (e.g., Firebase Storage, AWS S3)
      // For now, we'll create a data URL or store reference
      photoUrl = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`
    }

    // Parse other fields from formData if present
    const parsedCoordinates = req.body?.coordinates ? JSON.parse(req.body.coordinates) : undefined
    const bodyData = {
      category: req.body?.category,
      severity: req.body?.severity ? Number(req.body.severity) : undefined,
      coordinates: parsedCoordinates && typeof parsedCoordinates === 'object' && 'lat' in parsedCoordinates && 'lng' in parsedCoordinates
        ? { lat: Number(parsedCoordinates.lat), lng: Number(parsedCoordinates.lng) }
        : undefined,
      photoUrl: photoUrl,
      reporterName: req.body?.reporterName,
      description: req.body?.description,
      affectedCount: req.body?.affectedCount ? Number(req.body.affectedCount) : undefined,
    }

    const validation = ReportSubmissionSchema.safeParse(bodyData)
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.flatten() })
    }

    const { category, severity, coordinates, reporterName, description, affectedCount } =
      validation.data

    // Step 1: Verify photo authenticity with Gemini (skip if file is CSV/PDF)
    let photoVerification = { verified: true, confidence: 100, reasoning: 'File upload' }
    
    if (photoUrl && !fileName.endsWith('.csv') && !fileName.endsWith('.pdf')) {
      try {
        photoVerification = await geminiService.verifyPhotoAuthenticity(photoUrl)

        if (!photoVerification.verified && photoVerification.confidence < 40) {
          return res.status(400).json({
            error: 'Photo verification failed',
            confidence: photoVerification.confidence,
            reason: photoVerification.reasoning,
          })
        }
      } catch (error) {
        console.warn('Photo verification skipped:', error)
      }
    }

    // Step 2: Calculate urgency score
    const urgencyScore = (severity / 5) * 100

    // Step 3: Save to Firestore
    const incidentId = await firebaseService.createIncident({
      category,
      severity,
      coordinates,
      photoUrl,
      fileName: fileName || undefined,
      fileType: req.file?.mimetype || undefined,
      urgencyScore,
      verified: photoVerification.confidence > 70,
      geminiVerified: photoVerification.verified,
      reporterName: reporterName || 'Anonymous',
      description: description || '',
      affectedCount: affectedCount || 0,
      title: `${category} - ${new Date().toLocaleDateString()}`,
      location: 'Location TBD',
      timestamp: new Date().toISOString(),
    })

    res.status(201).json({
      success: true,
      incidentId,
      message: 'Report submitted successfully',
      verification: {
        photoVerified: photoVerification.verified,
        confidence: photoVerification.confidence,
      },
    })
  } catch (error: any) {
    console.error('Report submission error:', error)
    res.status(500).json({ error: error.message || 'Failed to submit report' })
  }
})

// Public endpoint: Get public reports for community verification
router.get('/public', async (req: Request, res: Response) => {
  try {
    const reports = await firebaseService.getIncidentsByStatus('pending')
    const publicReports = reports.slice(0, 5).map((r) => ({
      id: r.id,
      category: r.category,
      location: r.location,
      timestamp: r.timestamp,
      affectedCount: r.affectedCount,
      description: r.description,
      photoUrl: r.photoUrl,
    }))

    res.json(publicReports)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public reports' })
  }
})

export default router
