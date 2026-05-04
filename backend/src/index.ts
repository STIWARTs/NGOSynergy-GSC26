import express from 'express'
import cors from 'cors'
import admin from 'firebase-admin'
import dotenv from 'dotenv'
import { existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve as resolvePath } from 'path'

// Routes
import incidentsRouter from './routes/incidents.js'
import matchRouter from './routes/match.js'
import adminRouter from './routes/admin.js'
import reportsRouter from './routes/reports.js'
import digitizationRouter from './routes/digitization.js'
import verificationRouter from './routes/verification.js'
import volunteerRouter from './routes/volunteers.js'
import crisesRouter from './routes/crises.js'
import documentsRouter from './routes/documents.js'
import tasksRouter from './routes/tasks.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** PEM normalizer for env-based service account keys (dotenv quoting / Windows pastes). */
function normalizePrivateKey(key: string | undefined): string | undefined {
  if (!key || !key.trim()) return undefined

  let normalized = key.trim().replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')

  for (let i = 0; i < 4; i++) {
    const t = normalized.trim()
    const dq = t.startsWith('"') && t.endsWith('"')
    const sq = t.startsWith("'") && t.endsWith("'")
    if (dq || sq) {
      normalized = t.slice(1, -1).trim().replace(/\r\n/g, '\n')
      continue
    }
    break
  }

  // Strip stray leading/trailing ASCII or curly quotes (common broken .env pastes)
  normalized = normalized
    .replace(/^[\u201C\u201D\u201E\u201F"'`]+/, '')
    .replace(/[\u201C\u201D\u201E\u201F"'`]+$/, '')
    .trim()
    .replace(/\\n/g, '\n')

  const pemHeader = /-----BEGIN [A-Z0-9 -]+PRIVATE KEY-----/
  if (!pemHeader.test(normalized)) {
    console.warn('[Firebase] FIREBASE_PRIVATE_KEY is set but missing a PEM header — use GOOGLE_APPLICATION_CREDENTIALS JSON or fix .env quoting.')
    return undefined
  }

  return normalized.replace(/\s+$/gm, '').trimEnd()
}

function resolveServiceAccountJsonPath(): string | undefined {
  const raw = (
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    ''
  ).trim()
  if (!raw) return undefined
  const resolved = resolvePath(raw)
  const alt = resolvePath(process.cwd(), raw.replace(/^\.\//, ''))
  if (existsSync(resolved)) return resolved
  if (existsSync(alt)) return alt
  console.warn('[Firebase] Credential file path set but file not found:', resolved)
  return undefined
}

// Initialize Firebase Admin
try {
  let projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT
  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL

  const storageBucketFromProject = (id: string) =>
    process.env.FIREBASE_STORAGE_BUCKET || `${id}.firebasestorage.app`

  // Option A: Check for FIREBASE_CREDENTIALS_JSON (Render/production via env var)
  if (process.env.FIREBASE_CREDENTIALS_JSON) {
    try {
      const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON) as any
      if (!credentials.project_id) {
        throw new Error('Parsed credentials JSON missing project_id')
      }
      projectId ||= credentials.project_id
      clientEmail ||= credentials.client_email
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
        projectId,
        storageBucket: storageBucketFromProject(projectId),
      })
      console.log('Firebase Admin initialized from FIREBASE_CREDENTIALS_JSON environment variable (Render/Production mode)')
    } catch (parseErr) {
      throw new Error(`Failed to parse FIREBASE_CREDENTIALS_JSON: ${(parseErr as Error).message}`)
    }
  } else {
    // Option B: Check for file path
    const jsonPath = resolveServiceAccountJsonPath()
    if (jsonPath) {
      const sa = JSON.parse(readFileSync(jsonPath, 'utf8')) as any
      if (!sa.project_id) {
        throw new Error('Service account JSON missing project_id')
      }
      projectId ||= sa.project_id
      clientEmail ||= sa.client_email
      admin.initializeApp({
        credential: admin.credential.cert(jsonPath),
        projectId,
        storageBucket: storageBucketFromProject(projectId),
      })
      console.log('Firebase Admin initialized from service account file')
    } else {
      // Option C: Fall back to individual env vars (FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL)
      const rawKey = process.env.FIREBASE_PRIVATE_KEY
      const privateKey = normalizePrivateKey(rawKey)

      console.log('Firebase Config Check (.env credentials):')
      console.log(`- Project ID: ${projectId || '(missing)'}`)
      console.log(`- Client Email: ${clientEmail || '(missing)'}`)
      console.log(`- Private Key PEM length: ${privateKey?.length ?? 0}`)

      if (!projectId || !privateKey || !clientEmail) {
        const missing: string[] = []
        if (!projectId) missing.push('FIREBASE_PROJECT_ID')
        if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY (valid PEM)')
        if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL')
        throw new Error(
          `Missing required Firebase Admin credentials: ${missing.join(', ')}. ` +
            'Tip: download the service-account JSON from Firebase Console and set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_CREDENTIALS_JSON.'
        )
      }

      admin.initializeApp({
        credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
        projectId,
        storageBucket: storageBucketFromProject(projectId),
      })
      console.log('Firebase Admin initialized from environment variables')
    }
  }
} catch (err) {
  console.warn('Firebase Admin initialization failed — running in mock mode')
  console.warn('Reason:', (err as Error).message)
}

const app = express()
const PORT = process.env.PORT || 8080

// Parse CORS origins from environment variable (comma-separated)
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000,http://10.0.2.2:8080,http://10.0.2.2:3000').split(',').map(origin => origin.trim())

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: process.env.USE_VERTEX_AI === 'true' ? 'vertex-ai' : 'poc',
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use('/api/incidents', incidentsRouter)
app.use('/api/match', matchRouter)
app.use('/api/admin', adminRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/digitization', digitizationRouter)
app.use('/api/verification', verificationRouter)
app.use('/api/volunteers', volunteerRouter)
app.use('/api/crises', crisesRouter)
app.use('/api/documents', documentsRouter)
app.use('/api/tasks', tasksRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

app.listen(PORT, () => {
  console.log(`NGO Synergy Backend running on port ${PORT}`)
  console.log(`Mode: ${process.env.USE_VERTEX_AI === 'true' ? 'Vertex AI' : 'PoC (Local Model)'}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
