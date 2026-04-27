/**
 * Storage Service — Firebase Storage (GCS bucket)
 * Handles PDF/image uploads for digitized documents
 */

import admin from 'firebase-admin'
import { v4 as uuid } from 'uuid'

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
      console.warn('[Storage] Firebase not initialized — returning mock URL')
      return {
        storageUrl: `https://storage.googleapis.com/mock/${folder}/${filename}`,
        storagePath: `${folder}/${filename}`,
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
    if (admin.apps.length === 0) {
      return `https://storage.googleapis.com/mock/${storagePath}`
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
   */
  async downloadFile(storagePath: string): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    if (admin.apps.length === 0) {
      throw new Error('Firebase not initialized')
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
        filename: storagePath.split('/').pop() || 'document.pdf',
      }
    })
  },
}
