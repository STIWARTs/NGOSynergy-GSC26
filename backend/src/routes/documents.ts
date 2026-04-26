/**
 * Documents Route — Digitized Document Library + AI Chat
 * Manages documents saved after the full pipeline run
 */

import { Router, Request, Response } from 'express'
import { documentService } from '../services/documentService.js'
import { storageService } from '../services/storageService.js'
import { chatWithDocument, generateDocumentSummary } from '../services/docChatService.js'
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js'

const router = Router()

/**
 * GET /api/documents
 * List all digitized documents, sorted by date desc
 */
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const documents = await documentService.getAllDocuments()
    res.json({ documents, total: documents.length, timestamp: new Date().toISOString() })
  } catch (error: any) {
    console.error('[Documents] List error:', error.message)
    res.status(500).json({ error: error.message || 'Failed to fetch documents' })
  }
})

/**
 * GET /api/documents/:id
 * Get a single document's full metadata
 */
router.get('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const doc = await documentService.getDocument(req.params.id)
    if (!doc) return res.status(404).json({ error: 'Document not found' })
    res.json({ document: doc })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch document' })
  }
})

/**
 * GET /api/documents/:id/signed-url
 * Refresh the signed URL for a document's stored file (for PDF viewer)
 */
router.get('/:id/signed-url', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const doc = await documentService.getDocument(req.params.id)
    if (!doc) return res.status(404).json({ error: 'Document not found' })

    const signedUrl = await storageService.getSignedUrl(doc.storagePath)
    res.json({ signedUrl, expiresIn: '2 hours' })
  } catch (error: any) {
    console.error('[Documents] Signed URL error:', error.message)
    res.status(500).json({ error: error.message || 'Failed to generate signed URL' })
  }
})

/**
 * GET /api/documents/:id/chat
 * Get chat history for a document
 */
router.get('/:id/chat', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const history = await documentService.getChatHistory(req.params.id)
    res.json({ history, total: history.length })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch chat history' })
  }
})

/**
 * POST /api/documents/:id/chat
 * Send a message and get an AI response about the document
 * Body: { message: string }
 */
router.post('/:id/chat', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { message } = req.body
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const doc = await documentService.getDocument(req.params.id)
    if (!doc) return res.status(404).json({ error: 'Document not found' })

    // Get existing history
    const history = await documentService.getChatHistory(req.params.id)

    // Save user message
    const userMsg = await documentService.addChatMessage(req.params.id, 'user', message.trim())

    // Get AI response
    const aiReply = await chatWithDocument(doc, history, message.trim())

    // Save AI response
    const assistantMsg = await documentService.addChatMessage(req.params.id, 'assistant', aiReply)

    res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[Documents] Chat error:', error.message)
    res.status(500).json({ error: error.message || 'Chat failed' })
  }
})

/**
 * POST /api/documents/:id/summarize
 * Generate an initial AI summary when opening a document (no user message needed)
 */
router.post('/:id/summarize', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const doc = await documentService.getDocument(req.params.id)
    if (!doc) return res.status(404).json({ error: 'Document not found' })

    const summary = await generateDocumentSummary(doc)
    res.json({ summary })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Summary generation failed' })
  }
})

export default router
