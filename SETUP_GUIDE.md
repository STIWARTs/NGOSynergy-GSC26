# NGO Synergy Admin Dashboard — Setup & Integration Guide

## What Was Done (Latest Session)

### 1. Login Page — Sign In / Sign Up / Google Sign-In

**File:** `src/pages/Login.tsx`

- Added **Sign In / Create Account** tab toggle
- **"Sign in with Google"** button using Firebase Auth `GoogleAuthProvider` popup
- **"Already have an account? Sign in"** and **"Don't have an account? Create one"** links
- Friendly error messages (wrong password, email already in use, weak password, etc.)
- After account creation → auto-redirects to dashboard
- Falls back to **dev mode** (any email/password accepted) when Firebase web SDK is not yet configured

---

### 2. Google Maps Fixed

**File:** `.env.local` (created)

Added `VITE_GOOGLE_MAPS_API_KEY` so the Dashboard heatmap and Matching Engine map load correctly.

---

### 3. Firebase Web SDK Installed

```
npm install firebase
```

**File created:** `src/lib/firebase.ts`

- Initializes Firebase Web SDK from `VITE_FIREBASE_*` env vars
- Exports: `signInWithGoogle`, `signInWithEmail`, `signUpWithEmail`, `firebaseSignOut`, `onFirebaseAuthChange`, `getIdToken`
- Gracefully disabled when env vars are not set (dev mode fallback)

---

### 4. App Auth State (Firebase-Driven)

**File:** `src/App.tsx`

- Uses `onAuthStateChanged` to track Firebase auth state
- When Firebase is configured: auth is driven by Firebase user session
- When not configured: falls back to `localStorage` token (dev mode)
- Refreshes Firebase ID token into `localStorage` on every auth state change

---

### 5. API Client — Real Firebase ID Token

**File:** `src/api/client.ts`

- `fetchApi()` and `fetchApiFormData()` now call `firebase.getIdToken()` for auth headers
- Falls back to `localStorage.getItem('authToken')` when Firebase is not configured

---

### 6. Backend: Real Incidents Endpoint

**File:** `backend/src/routes/incidents.ts`

- `GET /api/incidents` now returns **all incidents** (was only returning `status=pending`)
- Supports optional `?status=` query param for filtering

---

### 7. Backend: Real Verification Endpoint

**File:** `backend/src/routes/verification.ts`

- `GET /api/verification` now fetches from `firebaseService.getVerifications()` instead of returning a hardcoded stub

---

### 8. Firebase Service — New Methods

**File:** `backend/src/services/firebaseService.ts`

Added:
- `getAllIncidents()` — returns all incidents from Firestore (or mock fallback)
- `getVerifications()` — returns all verification items from Firestore (or mock fallback)

---

### 9. Dashboard Map — Heatmap Weight Fix

**File:** `src/pages/Dashboard.tsx`

- Heatmap weight changed from `incident.severity * incident.impact` → `incident.urgencyScore`  
  (`impact` does not exist in the backend Incident type; `urgencyScore` is the correct field)
- Volunteer map pins now use real data from `useVolunteers()` hook instead of mock

---

### 10. Backend Mock Fallback (Previous Session)

**Files:** `backend/src/lib/mockData.ts`, `backend/src/services/firebaseService.ts`, `backend/src/index.ts`

- Firebase Admin initialization wrapped in `try/catch` — if credentials fail, backend runs in **mock mode** with in-memory data
- All `firebaseService` methods check `getDb()` and fall back to mock arrays if Firestore is unavailable

---

## Running the App

```powershell
npm run dev:all
```

Starts both servers concurrently:
- **Frontend**: http://localhost:5173 (Vite)
- **Backend**: http://localhost:8080 (Express + tsx watch)

---

## Environment Files

### Frontend — `.env.local` (root of project)

```env
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCcPx_nelNd0XpiLkiTym0hrHOM8-Kkm7s

# Firebase Web SDK (get from Firebase Console → Project Settings → Your apps → Web app)
VITE_FIREBASE_API_KEY=REPLACE_WITH_WEB_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=solutionchallenge-9e89a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=solutionchallenge-9e89a
VITE_FIREBASE_STORAGE_BUCKET=solutionchallenge-9e89a.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=REPLACE_WITH_SENDER_ID
VITE_FIREBASE_APP_ID=REPLACE_WITH_APP_ID

# Backend URL (empty = Vite proxy handles /api → localhost:8080)
VITE_API_URL=
```

> To get the missing values: Firebase Console → Project Settings → General → Your apps → Web app → SDK config

### Backend — `backend/.env`

| Variable | Status |
|---|---|
| `FIREBASE_PROJECT_ID` | ✅ Set |
| `FIREBASE_PRIVATE_KEY` | ✅ Set |
| `FIREBASE_CLIENT_EMAIL` | ✅ Set |
| `GEMINI_API_KEY` | ✅ Set |
| `GOOGLE_MAPS_API_KEY` | ✅ Set |
| `DOCUMENT_AI_PROJECT_ID` | ⏳ Not needed yet |
| `DOCUMENT_AI_PROCESSOR_ID` | ⏳ Not needed yet |

---

## Enabling Real Firebase Data (Firestore)

The backend currently falls back to **mock mode** if the private key fails to parse. To activate real Firestore:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key** → download the JSON
3. Open the JSON and copy the `private_key` value (it has real `\n` newlines)
4. Paste it into `backend/.env` as:
   ```
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
5. Restart the backend — you should see `Firebase Admin initialized successfully` in the logs

---

## Enabling Google Sign-In

1. Go to Firebase Console → Authentication → Sign-in providers
2. Enable **Google** provider
3. Add your domain (`localhost`) to authorized domains
4. Fill in `VITE_FIREBASE_*` values in `.env.local` (see above)
5. Restart frontend — the "Continue with Google" button will work

---

## Architecture Overview

```
Browser (React + Vite :5173)
    │
    │  /api/* → proxy →
    ▼
Express Backend (:8080)
    │
    ├── Firebase Admin SDK → Firestore (real data)
    │   └── Mock fallback if credentials fail
    ├── Gemini API → Photo verification
    └── Google Maps API → Distance calculation
```
