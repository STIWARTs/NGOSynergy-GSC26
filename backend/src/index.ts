import express from 'express'
import cors from 'cors'
import admin from 'firebase-admin'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Routes
import incidentsRouter from './routes/incidents.js'
import matchRouter from './routes/match.js'
import adminRouter from './routes/admin.js'
import reportsRouter from './routes/reports.js'
import digitizationRouter from './routes/digitization.js'
import verificationRouter from './routes/verification.js'
import volunteerRouter from './routes/volunteers.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  projectId: process.env.FIREBASE_PROJECT_ID,
})

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(cors())
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
