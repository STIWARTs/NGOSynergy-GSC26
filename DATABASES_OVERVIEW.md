# NGO Synergy - Database Architecture

This document provides a complete overview of the two database environments used in the NGO Synergy project: the **Local Mock Database** and the **Real Firebase Firestore Database**. It explains where they are located, what data they contain, and how to switch between them.

---

## 1. Local Mock Database (Offline / Fallback Mode)

The Mock Database is a hardcoded set of data designed for rapid frontend development, testing, and offline demonstration without requiring a live connection to Google Cloud.

* **File Location**: `backend/src/lib/mockData.ts`
* **Service Handler**: `backend/src/services/firebaseService.ts` (specifically via the `firestoreFallback` wrapper)
* **Current Status**: **INACTIVE** (Mock data has been migrated to real Firebase)

### What It Includes
The mock database simulates all the core collections needed by the app:

1. **Incidents (`mockIncidents`)**:
   * Exactly **6 hardcoded incidents** located in the **Raipur, Chhattisgarh** region.
   * Includes incidents like: Downtown Flooding, Earthquake Damage, Fire Outbreak, etc.
   * Hardcoded coordinates center around `lat: 21.25, lng: 81.62`.
2. **Volunteers (`mockVolunteers`)**:
   * Exactly **30 generated volunteers**.
   * The first 8 are distinctly named (Alice, David, Emma, etc.), while the remaining 22 are auto-generated dynamically to reach 30.
   * They have predefined statuses (`active`, `deployed`, `inactive`), skills, and coordinates scattered around Raipur.
3. **Assignments (`mockAssignments`)**:
   * Simulates active dispatches (e.g., linking Volunteer 7 to Incident 1).
4. **Digitization Queue & Verifications (`mockDigitizationQueue`, `mockVerifications`)**:
   * Pre-filled examples of field survey PDFs and photo verification tasks.
5. **Global Config (`mockGlobalConfig`)**:
   * Static AI weighting parameters (`a: 0.4`, `b: 0.3`, etc.).

---

## 2. Real Database (Firebase Firestore + Storage)

The Real Database is the production-grade, live cloud database hosted on Google Cloud. It is required for full functionality, including saving real digitized documents, storing live AI chat history, and deploying actual field workers.

* **Host**: Google Firebase (Project ID: `solutionchallenge-9e89a`)
* **Initialization Location**: `backend/src/index.ts` (using `firebase-admin`)
* **Configuration**: `backend/.env` (requires `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_STORAGE_BUCKET`)
* **Current Status**: **ACTIVE** (Primary database after migration)

### What It Includes
The real database scales dynamically and contains the actual live data collections:

1. **`incidents`**: Live emergency reports submitted from the field.
2. **`volunteers`**: Real registered fieldworkers and their live GPS coordinates.
3. **`digitized_documents`** *(New)*:
   * Metadata for field reports processed by Document AI and Gemini.
   * **Sub-collection `chat_history`**: Saves every persistent message between the user and the Gemini AI regarding a specific document.
4. **Firebase Storage (`digitized-pdfs`)**:
   * A Google Cloud Storage bucket where actual `.pdf` and image files are securely uploaded and served to the frontend via Signed URLs.
5. **`globalConfig`**: Live tunable AI parameters that affect the Matching Engine.

---

## Current Database Status (Updated)

**As of migration date**: The application is now using the **Real Firebase Database** as the primary data source.

### Migration Summary:
- ✅ All mock data (incidents, volunteers, assignments, digitization queue, verifications, global config) has been migrated to real Firebase
- ✅ Existing Firebase data preserved: `digitized_documents`, `chat_history`, and `digitized-pdfs` storage bucket
- ✅ Old mock fallback system disabled in `firebaseService.ts`
- ✅ Application now connects directly to Firebase Firestore

### Migration Script:
- **Location**: `backend/src/scripts/migrateMockToReal.ts`
- **Run Command**: `cd backend && npm run migrate:mock-to-real`
- **Purpose**: One-time migration to transfer mock data to production Firebase

---

## How to Switch Between Databases (Historical Reference)

**Note**: The application is currently configured to use the **Real Firebase Database**. The mock database is no longer actively used but remains available for development/testing if needed.

### To use the **Real Firebase Database** (Current setup):
The `getDb()` function in `firebaseService.ts` returns the actual Firestore instance:
```typescript
// backend/src/services/firebaseService.ts
function getDb() {
  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin is not initialized.')
  }
  return admin.firestore() // Connects to real Firebase
}
```

### To use the **Mock Database** (For development/testing only):
Temporarily modify `getDb()` to return `null` to force fallback to mock data:
```typescript
// backend/src/services/firebaseService.ts
function getDb() {
  return null as any // Forces fallback to mock data (dev/testing only)
}
```

** Important**: The mock database should only be used for local development and testing. The production environment should always use the real Firebase database.
