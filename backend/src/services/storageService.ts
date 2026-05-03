/**
 * Storage Service — Firebase Storage (GCS bucket)
 * Handles PDF/image uploads for digitized documents
 */

import admin from 'firebase-admin'
import { existsSync, readFileSync } from 'fs'
import { basename, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuid } from 'uuid'

const __svcDir = dirname(fileURLToPath(import.meta.url))

function getBucketCandidates(): string[] {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const configured = process.env.FIREBASE_STORAGE_BUCKET
  const candidates = [
    configured,
    projectId ? `${projectId}.appspot.com` : undefined,
    projectId ? `${projectId}.firebasestorage.app` : undefined,
  ].filter(Boolean) as string[]

  return [...new Set(candidates)]
}

let cachedDemoPdf: Buffer | null = null

function loadDemoPdfBuffer(): Buffer {
  if (cachedDemoPdf) return cachedDemoPdf
  const candidates = [join(__svcDir, '..', 'lib', 'demo-sample.pdf')]
  for (const p of candidates) {
    if (existsSync(p)) {
      cachedDemoPdf = readFileSync(p)
      return cachedDemoPdf
    }
  }
  console.warn('[Storage] demo-sample.pdf missing; using tiny PDF placeholder.')
  cachedDemoPdf = Buffer.from(
    `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n100\n%%EOF\n`,
    'utf8'
  )
  return cachedDemoPdf
}

/** Demo / offline paths that should never hit public GCS in the browser. */
function shouldUseEmbeddedDemoPdf(storagePath: string): boolean {
  const p = (storagePath || '').toLowerCase()
  return !!p.trim() && (p.includes('/mock/') || p.includes('mock-doc-'))
}

async function withResolvedBucket<T>(
  operation: (bucket: any, bucketName: string) => Promise<T>
): Promise<T> {
  const bucketCandidates = getBucketCandidates()
  let lastError: any

  for (const bucketName of bucketCandidates) {
    try {
      const bucket = admin.storage().bucket(bucketName)
      return await operation(bucket, bucketName)
    } catch (error: any) {
      lastError = error
      console.warn(`[Storage] Bucket attempt failed (${bucketName}): ${error?.message || error}`)
    }
  }

  throw new Error(lastError?.message || 'No Firebase Storage bucket could be resolved')
}

export const storageService = {
  /**
   * Upload a file buffer to Firebase Storage.
   * Returns a signed URL valid for 7 days.
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder = 'digitized-pdfs'
  ): Promise<{ storageUrl: string; storagePath: string }> {
    if (admin.apps.length === 0) {
      const ext = filename.split('.').pop() || 'pdf'
      const storagePath = `${folder}/${uuid()}.${ext}`
      console.warn('[Storage] Firebase not initialized — local placeholder path (empty storageUrl)')
      return {
        storageUrl: '',
        storagePath,
      }
    }

    const fileId = uuid()
    const ext = filename.split('.').pop() || 'pdf'
    const storagePath = `${folder}/${fileId}.${ext}`

    return withResolvedBucket(async (bucket, bucketName) => {
      const file = bucket.file(storagePath)
      await file.save(buffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: filename,
            uploadedAt: new Date().toISOString(),
          },
        },
      })

      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      })

      console.log(`[Storage] Uploaded using bucket: ${bucketName}`)
      return { storageUrl: signedUrl, storagePath }
    })
  },

  /**
   * Generate a fresh signed URL for an existing file in storage.
   */
  async getSignedUrl(storagePath: string): Promise<string> {
    if (admin.apps.length === 0 || shouldUseEmbeddedDemoPdf(storagePath)) {
      throw new Error(
        'Signed GCS URLs are unavailable for demo/offline placeholders — use GET /api/documents/:id/file'
      )
    }

    return withResolvedBucket(async (bucket) => {
      const file = bucket.file(storagePath)
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 2 * 60 * 60 * 1000,
      })
      return signedUrl
    })
  },

  /**
   * Download a file from Firebase Storage and return bytes + metadata.
   * Uses bundled demo-sample.pdf when Firebase is off or for mock-demo storage paths.
   */
  async downloadFile(storagePath: string): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    const filename = basename(storagePath || 'document.pdf')

    if (admin.apps.length === 0 || shouldUseEmbeddedDemoPdf(storagePath)) {
      return {
        buffer: loadDemoPdfBuffer(),
        mimeType: 'application/pdf',
        filename,
      }
    }

    return withResolvedBucket(async (bucket) => {
      const file = bucket.file(storagePath)
      const [exists] = await file.exists()
      if (!exists) {
        throw new Error(`File not found in storage: ${storagePath}`)
      }

      const [metadata] = await file.getMetadata()
      const [buffer] = await file.download()

      return {
        buffer,
        mimeType: metadata.contentType || 'application/pdf',
        filename,
      }
    })
  },
}
