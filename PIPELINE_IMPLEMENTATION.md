# Data Digitization Pipeline — Complete Implementation Guide

> **Project:** NGO Synergy Admin Dashboard  
> **Feature:** Data Digitization Pipeline -> Prioritized Issues Dashboard  

---

## Architecture Overview

```
[ User Input: Image / PDF / Text ]
            |
[ Document AI (OCR) ] <- Google Cloud Document AI
   Extracts raw text from PDFs, JPEGs, PNGs, TIFFs
            |
[ Preprocessing ]
   Cleans text, normalizes categories,
   fixes OCR errors, removes noise
            |
[ Gemini AI (JSON Extraction) ] <- Schema-Enforced via responseSchema
   Outputs: category, severity, urgency,
   people_affected, location_name, summary
            |
[ Validation ]
   Validates all fields (Zod-style manual validation)
   Ensures valid category, severity 1-10, urgency LOW/MEDIUM/HIGH
            |
[ Priority Score Calculation ] <- Hybrid Pro Formula
   PriorityScore = (Cat x 0.4) + (Sev x 0.3) + (Scale x 0.2) + (Wait x 0.1)
            |
[ Firestore Database ] <- Collection: crises
   Stores full crisis object with priorityBreakdown
            |
[ Admin Dashboard ] <- Prioritized Issues Panel
   Displays sorted by priorityScore (highest = most urgent)
```

---

## Priority Formula (Hybrid Pro Formula — Solution Challenge 2026)

```
PriorityScore = (CategoryScore x 0.4)
              + (SeverityScore x 0.3)
              + (ScaleFactor x 0.2)
              + (WaitTimeFactor x 0.1)
```

### Category Weights

| Category | Weight | Reasoning |
|----------|--------|-----------|
| Health   | 10     | Life-threatening medical emergencies |
| Rescue   | 8      | People trapped, active danger |
| Water    | 6      | Critical survival need |
| Food     | 5      | Humanitarian necessity |
| Shelter  | 4      | Important but less immediate |

### ScaleFactor Formula

```
ScaleFactor = min(log10(people_affected + 1) x 2.5, 10)

Examples:
  10 people   -> 2.5
  100 people  -> 5.0
  1000 people -> 7.5
  10000+      -> 10.0 (capped)
```

### Gemini Response Schema (2026 Pro Move)

```json
{
  "type": "object",
  "properties": {
    "category":        { "type": "string", "enum": ["Water","Food","Health","Shelter","Rescue"] },
    "severity":        { "type": "number" },
    "urgency":         { "type": "string", "enum": ["LOW","MEDIUM","HIGH"] },
    "people_affected": { "type": "number" },
    "location_name":   { "type": "string" },
    "summary":         { "type": "string" }
  },
  "required": ["category","severity","urgency","location_name","summary"]
}
```

---

## Files Changed / Created

### Backend — New Files

#### 1. `backend/src/services/pipelineService.ts` - MAIN ENGINE
> The full pipeline orchestrator. Implements all 5 steps in one TypeScript service.

**Key exports:**
```typescript
pipelineService.processDocument(buffer, filename)  // Full pipeline (with OCR)
pipelineService.processText(rawText)               // Skip OCR, text only
pipelineService.getAllCrises(limit)                // Fetch sorted by priorityScore
pipelineService.getCrisesByCategory(category)      // Filter by category
pipelineService.updateCrisisStatus(id, status)     // Update status in Firestore
```

**Pipeline steps inside:**
| Step | Function | What it does |
|------|----------|-------------|
| 1 | `runOCR()` | Calls Document AI, detects MIME type, returns text + confidence |
| 2 | `preprocess()` | Cleans text, normalizes "medical" -> "Health crisis", etc. |
| 3 | `extractWithGemini()` | Calls Gemini 1.5 Flash with responseSchema, returns typed JSON |
| 4 | `validateCrisisData()` | Manual Zod-style validation, throws descriptive errors |
| 5 | `calculatePriorityScore()` | Applies the Hybrid Pro Formula with full breakdown |
| 6 | `saveToFirestore()` | Saves to `crises` collection with `createdAt` timestamp |

**Fallback behavior:**
- Document AI not configured -> uses realistic mock OCR text
- Gemini API key missing -> returns mock structured data
- Firebase not initialized -> returns mock ID (`mock-{timestamp}`)

---

#### 2. `backend/src/routes/crises.ts` — New API Route

```
GET  /api/crises            -> All crises sorted by priorityScore desc
GET  /api/crises?category=Health  -> Filter by category
GET  /api/crises?limit=20   -> Limit results
PATCH /api/crises/:id/status -> Update status (pending/active/resolved/dismissed)
```

---

#### 3. `backend/src/routes/digitization.ts` — Updated (Full Replacement)

**New endpoint added:**
```
POST /api/digitization/process
```

Accepts:
- `multipart/form-data` with `file` field -> runs full OCR pipeline (multer)
- `application/json` with `{ "text": "..." }` -> skips OCR, text-only path

**Legacy endpoints kept** (backward compat):
```
POST /api/digitization/upload   <- old Document AI only
GET  /api/digitization/queue    <- HITL queue
POST /api/digitization/commit   <- commit digitized doc as incident
```

---

### Backend — Modified Files

#### `backend/src/index.ts`

```typescript
// Added import:
import crisesRouter from './routes/crises.js'

// Added route registration:
app.use('/api/crises', crisesRouter)
```

---

### Frontend — New Files

#### 4. `src/api/crises.ts` — Frontend API Service

```typescript
crisesService.getAll(limit)                    // GET /api/crises
crisesService.getByCategory(category)          // GET /api/crises?category=...
crisesService.updateStatus(id, status)         // PATCH /api/crises/:id/status
crisesService.processPipelineFile(file)        // POST /api/digitization/process (multipart)
crisesService.processPipelineText(text)        // POST /api/digitization/process (json)
```

---

#### 5. `src/hooks/useCrises.ts` — React Query Hooks

```typescript
useCrises(limit)              // Fetches all crises, refetches every 60s
useCrisesByCategory(cat)      // Filtered crises
useUpdateCrisisStatus()       // Mutation to update status
usePipelineProcess()          // Mutation: upload file through full pipeline
usePipelineProcessText()      // Mutation: text through pipeline (skip OCR)
```

---

#### 6. `src/components/shared/PrioritizedIssues.tsx` - DASHBOARD PANEL

> The main dashboard panel showing pipeline output, sorted by priority.

**Features:**
- **Priority Ring** — animated SVG circle, color-coded (red/amber/green)
- **Breakdown Bars** — shows Category / Severity / Scale / WaitTime contributions
- **Category Filter** — All / Health / Rescue / Water / Food / Shelter
- **Expandable rows** — click to see full breakdown + action buttons
- **Action buttons** — Mark Active / Resolve / Dismiss (calls PATCH API)
- **Auto-refresh** — every 60 seconds, with manual refresh button
- **Architecture breadcrumb** — shows the pipeline steps in the header
- **Relative timestamps** — "2h ago", "15m ago"
- **People affected** — displayed with icon

---

#### 7. `src/components/digitization/PipelineUpload.tsx` - PIPELINE UI

> The new "Full Pipeline" tab in Digitization Hub.

**Features:**
- **Animated step flow** — each step lights up as pipeline runs
  - `Upload -> Document AI (OCR) -> Preprocessing -> Gemini AI -> Validation -> Firestore`
- **File upload** — drag-and-drop or click to browse
  - Accepts: JPEG, PNG, TIFF, PDF (max 20MB)
- **Text mode** — paste raw field report text (skips OCR)
- **Result display** — shows category, severity, priority score, summary, Firestore ID
- **OCR metadata** — confidence %, chars extracted, processing time (ms)
- **Error display** — clear error messages with dismiss button

---

### Frontend — Modified Files

#### `src/lib/queryKeys.ts`

```typescript
// Added:
crises: {
  all: ['crises'] as const,
  byCategory: (category: string) => ['crises', category] as const,
}
```

#### `src/pages/Dashboard.tsx`

```tsx
// Added import:
import PrioritizedIssues from '@/components/shared/PrioritizedIssues'

// Added panel below the 3-column section:
{/* Prioritized Issues — Data Digitization Pipeline Output */}
<div className="mt-2">
  <PrioritizedIssues />
</div>
```

#### `src/pages/DigitizationHub.tsx`

```tsx
// Added tab as DEFAULT (first tab):
{ id: 'pipeline', label: 'Full Pipeline', icon: Zap, badge: 'NEW' }

// Added component render:
{activeTab === 'pipeline' && <PipelineUpload />}

// Updated subtitle to show architecture:
"Architecture: User Input -> Document AI (OCR) -> Preprocessing -> Gemini JSON -> Validate -> Firestore"
```

---

## New Dependencies

```bash
# Backend
npm install multer @types/multer --save
```

Multer is used to handle `multipart/form-data` file uploads in the `/api/digitization/process` endpoint. It stores files in memory buffer (no disk writes) and filters to allowed MIME types only.

---

## Firestore Collection: `crises`

### Document Schema

```typescript
{
  // Core crisis data (from Gemini AI)
  category: "Water" | "Food" | "Health" | "Shelter" | "Rescue",
  severity: number,           // 1-10
  urgency: "LOW" | "MEDIUM" | "HIGH",
  people_affected: number,
  location_name: string,
  summary: string,

  // Priority calculation
  priorityScore: number,       // e.g. 8.73 — SORT BY THIS
  priorityBreakdown: {
    categoryScore: number,     // category_weight * 0.4
    severityScore: number,     // severity * 0.3
    scaleScore: number,        // scale_factor * 0.2
    waitTimeScore: number,     // wait_time * 0.1
  },
  scaleFactor: number,         // log10(people_affected + 1) * 2.5

  // Metadata
  status: "pending" | "active" | "resolved" | "dismissed",
  originalText: string,        // Raw OCR/input text
  createdAt: Timestamp,        // Firestore server timestamp
}
```

---

## API Reference

### `POST /api/digitization/process` — Run Full Pipeline

**Option A — File Upload (with OCR):**
```
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  file: <File> (JPEG/PNG/TIFF/PDF, max 20MB)
```

**Option B — Raw Text (skip OCR):**
```
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "text": "Severe water shortage in Village A..."
}
```

**Response:**
```json
{
  "success": true,
  "id": "firestore-doc-id",
  "crisis": {
    "category": "Water",
    "severity": 8,
    "urgency": "HIGH",
    "people_affected": 450,
    "location_name": "Village A, Sector 3",
    "summary": "Severe water shortage affecting 450 people...",
    "priorityScore": 8.23,
    "priorityBreakdown": {
      "categoryScore": 2.4,
      "severityScore": 2.4,
      "scaleScore": 1.33,
      "waitTimeScore": 0
    },
    "status": "pending",
    "createdAt": "2026-04-25T..."
  },
  "pipelineMetadata": {
    "ocrConfidence": 0.91,
    "mimeType": "image/jpeg",
    "textLength": 342,
    "processingTimeMs": 2150
  },
  "message": "Pipeline complete. Crisis stored with Priority Score: 8.23"
}
```

---

### `GET /api/crises` — Get Prioritized Issues

```
GET /api/crises?limit=50
GET /api/crises?category=Health
Authorization: Bearer <token>
```

**Response:**
```json
{
  "crises": [ ...sorted by priorityScore desc... ],
  "total": 12,
  "timestamp": "2026-04-25T...",
  "sortedBy": "priorityScore"
}
```

---

### `PATCH /api/crises/:id/status` — Update Status

```
PATCH /api/crises/abc123/status
Authorization: Bearer <token>

Body: { "status": "active" }
```

Valid statuses: `pending` | `active` | `resolved` | `dismissed`

---

## UI Screenshots Reference

### Dashboard — Prioritized Issues Panel
- Located below the Map / Volunteers / Live Feed row
- Shows architecture: `OCR -> Preprocess -> Gemini AI -> Validate -> Priority Score -> Firestore`
- Each crisis card shows: category icon, priority ring, urgency badge, location, summary, people count, time
- Click any card to expand priority breakdown bars

### Digitization Hub — Full Pipeline Tab
- Default tab with "NEW" badge
- Two modes: File Upload (drag-drop) or Raw Text
- Animated pipeline steps during processing
- Success result shows priority score prominently

---

## Environment Variables Required

```env
# Backend .env

# Google Document AI (OCR)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
DOCUMENT_AI_LOCATION=us
DOCUMENT_AI_PROCESSOR_ID=your-processor-id

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Firebase Admin
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

> **Without these vars:** Pipeline runs in mock mode — still demonstrates full architecture flow, returns realistic mock data.

---

## What Makes This a Winning Implementation

| Feature | Standard Approach | Our Implementation |
|---------|------------------|-------------------|
| JSON Extraction | `responseMimeType: "application/json"` | `responseSchema` (schema-enforced, no hallucinations) |
| File Support | Hardcoded `image/jpeg` | Auto-detects MIME from magic bytes + extension |
| Priority | Raw severity number | Hybrid Pro Formula (4 weighted components) |
| Storage | Raw AI output | Computed data: priorityScore + breakdown + scaleFactor |
| Dashboard | Manual ordering | Auto-sorted by priorityScore, real-time |
| Error handling | Basic try/catch | Step-specific errors, graceful mock fallbacks |
| Validation | None | Zod-style validation with descriptive error messages |

---

## Commit Message (Suggested)

```
feat(pipeline): implement full Data Digitization Pipeline with prioritized dashboard

Architecture: User Input -> Document AI OCR -> Preprocessing -> Gemini AI (schema-enforced)
-> Validation -> Priority Score -> Firestore crises collection -> Admin Dashboard

- Add pipelineService.ts: full 6-step orchestrator with Hybrid Pro Formula
- Add GET /api/crises: returns crises sorted by priorityScore desc
- Add POST /api/digitization/process: multer file upload + text input paths
- Add PrioritizedIssues.tsx: dashboard panel with priority rings & breakdown bars
- Add PipelineUpload.tsx: animated full pipeline UI in Digitization Hub
- Add useCrises.ts hook + crises API service layer
- Register /api/crises route in backend index.ts
- Install multer for multipart file upload handling

Priority Formula: (Category x 0.4) + (Severity x 0.3) + (ScaleFactor x 0.2) + (WaitTime x 0.1)
Health=10 > Rescue=8 > Water=6 > Food=5 > Shelter=4
```
