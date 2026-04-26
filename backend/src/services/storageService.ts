/**
 * Storage Service — Firebase Storage (GCS bucket)
 * Handles PDF/image uploads for digitized documents
 */

import admin from 'firebase-admin'
import { v4 as uuid } from 'uuid'

const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`

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

    const bucket = admin.storage().bucket(BUCKET_NAME)
    const fileId = uuid()
    const ext = filename.split('.').pop() || 'pdf'
    const storagePath = `${folder}/${fileId}.${ext}`

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

    // Generate a signed URL valid for 7 days
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })

    return { storageUrl: signedUrl, storagePath }
  },

  /**
   * Generate a fresh signed URL for an existing file in storage.
   */
  async getSignedUrl(storagePath: string): Promise<string> {
    if (admin.apps.length === 0) {
      return `https://storage.googleapis.com/mock/${storagePath}`
    }
    const bucket = admin.storage().bucket(BUCKET_NAME)
    const file = bucket.file(storagePath)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    })
    return signedUrl
  },
}
