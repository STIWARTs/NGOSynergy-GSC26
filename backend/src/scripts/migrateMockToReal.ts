/**
 * Migration Script: Mock Data to Real Firebase Database
 * 
 * This script transfers all mock data to the real Firebase Firestore database.
 * It will:
 * 1. Delete existing incidents and volunteers from Firebase
 * 2. Insert mock incidents, volunteers, assignments, digitization queue, verifications, and global config
 * 3. Preserve digitized_documents, chat_history, and digitized-pdfs (Firebase Storage)
 * 
 * Usage: npm run migrate-mock-to-real
 */

import admin from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import {
  mockIncidents,
  mockVolunteers,
  mockAssignments,
  mockGlobalConfig,
  mockDigitizationQueue,
  mockVerifications,
} from '../lib/mockData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', '..', 'solutionchallenge-9e89a-firebase-adminsdk-fbsvc-ea0cd36d71.json')

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account key not found at:', serviceAccountPath)
  process.exit(1)
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function clearCollection(collectionName: string) {
  console.log(`🗑️  Clearing collection: ${collectionName}`)
  const snapshot = await db.collection(collectionName).get()
  const batch = db.batch()
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref)
  })
  
  if (snapshot.docs.length > 0) {
    await batch.commit()
    console.log(`   Deleted ${snapshot.docs.length} documents from ${collectionName}`)
  } else {
    console.log(`   Collection ${collectionName} is already empty`)
  }
}

async function insertDocuments(collectionName: string, documents: any[]) {
  console.log(`📝 Inserting ${documents.length} documents into ${collectionName}`)
  
  const batchSize = 500 // Firestore batch limit
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = db.batch()
    const chunk = documents.slice(i, i + batchSize)
    
    chunk.forEach((doc) => {
      const docRef = db.collection(collectionName).doc(doc.id)
      batch.set(docRef, doc)
    })
    
    await batch.commit()
    console.log(`   Inserted batch of ${chunk.length} documents`)
  }
}

async function migrateData() {
  console.log('🚀 Starting Mock Data to Real Firebase Migration\n')
  
  try {
    // Step 1: Clear existing data (only incidents and volunteers)
    console.log('📋 Step 1: Clearing existing incidents and volunteers...')
    await clearCollection('incidents')
    await clearCollection('volunteers')
    console.log('')
    
    // Step 2: Insert mock incidents
    console.log('📋 Step 2: Inserting mock incidents...')
    await insertDocuments('incidents', mockIncidents)
    console.log(`   ✅ Inserted ${mockIncidents.length} incidents\n`)
    
    // Step 3: Insert mock volunteers
    console.log('📋 Step 3: Inserting mock volunteers...')
    await insertDocuments('volunteers', mockVolunteers)
    console.log(`   ✅ Inserted ${mockVolunteers.length} volunteers\n`)
    
    // Step 4: Insert mock assignments
    console.log('📋 Step 4: Inserting mock assignments...')
    await insertDocuments('assignments', mockAssignments)
    console.log(`   ✅ Inserted ${mockAssignments.length} assignments\n`)
    
    // Step 5: Insert mock global config
    console.log('📋 Step 5: Inserting global config...')
    await db.collection('globalConfig').doc('ai_weights').set(mockGlobalConfig)
    console.log('   ✅ Inserted global config\n')
    
    // Step 6: Insert mock digitization queue
    console.log('📋 Step 6: Inserting digitization queue...')
    await clearCollection('digitization_queue')
    await insertDocuments('digitization_queue', mockDigitizationQueue)
    console.log(`   ✅ Inserted ${mockDigitizationQueue.length} digitization queue items\n`)
    
    // Step 7: Insert mock verifications
    console.log('📋 Step 7: Inserting verifications...')
    await clearCollection('verifications')
    await insertDocuments('verifications', mockVerifications)
    console.log(`   ✅ Inserted ${mockVerifications.length} verifications\n`)
    
    // Summary
    console.log('🎉 Migration completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Incidents: ${mockIncidents.length}`)
    console.log(`   - Volunteers: ${mockVolunteers.length}`)
    console.log(`   - Assignments: ${mockAssignments.length}`)
    console.log(`   - Global Config: 1 document`)
    console.log(`   - Digitization Queue: ${mockDigitizationQueue.length}`)
    console.log(`   - Verifications: ${mockVerifications.length}`)
    console.log('\n✅ Preserved (not modified):')
    console.log('   - digitized_documents collection')
    console.log('   - chat_history sub-collections')
    console.log('   - digitized-pdfs Firebase Storage bucket')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateData()
