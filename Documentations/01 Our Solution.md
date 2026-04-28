# NGO Synergy (GSC 2026) — AI-Powered Crisis Coordination

NGO Synergy is a **unified crisis-response platform** that turns raw field reports (photos, PDFs, free-text) into **verified, prioritized incidents** and then **matches + dispatches the right volunteers**—with real-time mapping and an auditable, human-in-the-loop workflow.

## Why This Directly Fits the Problem Statement (PS)
The PS asks for a system that (1) **gathers scattered community information**, (2) **clearly shows the most urgent local needs**, and (3) **quickly matches available volunteers** to the right tasks and locations.

NGO Synergy addresses this end-to-end:
- **Gather scattered inputs**: digitizes paper surveys/field reports (images, PDFs, text) into a single structured dataset.
- **Make urgency visible**: converts unstructured narratives into validated fields (category, severity, people affected, location) and computes an explainable priority score.
- **Smart matching + connection**: ranks volunteers using skills + availability + distance/ETA, then dispatches assignments to the mobile app as actionable tasks.
- **Operational clarity for teams**: maps, queues, and verification flows keep decision-making fast, transparent, and auditable.

## The Problem
During emergencies, NGOs receive chaotic, unstructured information across channels (WhatsApp photos, PDFs, voice-to-text notes). Teams lose time to:
- Manual triage and duplicate entry
- Unverified / misleading media
- Poor coordination between HQ and field volunteers
- Travel-time blind dispatch decisions

## The Solution
A single system with three connected experiences:
- **Web Admin Console (React)**: triage, verification, incident management, matching, analytics, and configuration.
- **Mobile Volunteer App (Flutter)**: sign-in, map-based navigation, task list, and on-field updates.
- **Backend API (Node/Express)**: secure orchestration of AI + data + routing.

All clients share **one Firebase project** for identity and operational data.

## What Makes It Judge-Strong
- **Schema-enforced extraction**: Gemini outputs strict JSON that is validated before it ever becomes “data”.
- **Explainable prioritization**: a transparent priority score (severity, category, scale, time) designed for fairness.
- **Human-in-the-loop (HITL)**: AI accelerates decisions, humans finalize critical actions.
- **Safety checks**: AI-assisted verification flags suspicious or inconsistent evidence.
- **Offline/low-config demo path**: backend supports a mock/dev mode to keep demos reliable.

## Architecture (How Everything Connects)

### High-level components
- **Web (Admin)**: React + TypeScript + Vite + Tailwind + React Query; uses Firebase Web SDK for sign-in.
- **Mobile**: Flutter + Firebase Auth + Google Sign-In; communicates with the same API.
- **API**: Express + TypeScript; verifies Firebase ID tokens and applies role-based access.
- **Data backbone**: Firestore (operational records) + Storage bucket (documents/media).
- **AI services**: Document AI (OCR), Gemini (structured extraction + verification + doc chat), Vertex AI (optional ranking).
- **Mapping**: Google Maps (web + mobile) + Distance Matrix/Geocoding APIs (routing + ETA).

### Web + Mobile → same Firebase backend (the exact security model)
1. User signs in (web or mobile) via **Firebase Auth** (Google provider supported).
2. Client obtains a **Firebase ID token**.
3. Client calls the API with `Authorization: Bearer <idToken>`.
4. Backend uses **Firebase Admin** to `verifyIdToken()` and derives `uid`, `email`, and `role` (custom claim).
5. Backend performs reads/writes to **Firestore** and files to **Storage**, under server-side permissions.

This pattern keeps **clients thin and secure**: the database is accessed through server-validated identities and role guards.

## Core Workflows

### 1) Crisis Intake & Digitization (Image/PDF/Text → Structured Data)
1. Upload or submit a report (document, photo, or raw text).
2. **Document AI OCR** extracts text and entities from images/PDFs.
3. Preprocessing cleans OCR output and extracts hints (numbers, locations, category cues).
4. **Gemini** converts the report into **strict JSON** (schema + response MIME type JSON).
5. **Zod validation** rejects malformed output; a priority score is computed.
6. Structured crisis/incident data is stored in **Firestore**; evidence can be stored in **Storage**.

Note: the repo also contains a standalone, runnable **Data Digitization Pipeline** package (under `backend/Data Digitization Pipeline/`) that demonstrates the same OCR → Gemini → validation → Firestore flow end-to-end.

### 2) Verification Center (Trust + Accuracy)
- Gemini-assisted checks help spot:
  - inconsistencies (text vs. image)
  - suspicious media patterns
  - missing required details
- An admin can approve/reject and push the record into operational status.

### 3) Matching Engine (Right Volunteer, Right Time)
- Inputs: incident needs, volunteer skills, availability, proximity, and history.
- Ranking options:
  - **Vertex AI Prediction** (optional) for hosted ranking
  - **Local Python model fallback** (scikit-learn RandomForest) when Vertex isn’t enabled
- Travel time and feasibility incorporate **Google Distance Matrix** + geocoding.
- Once deployed, assignments appear as tasks for volunteers in the mobile app.

### 4) Maps & Dispatch
- Admin dashboard visualizes incidents/volunteers using **Google Maps JS**.
- Mobile uses **Google Maps Flutter** for navigation context.
- Backend can geocode locations and compute ETAs for practical dispatch decisions.

### 5) Document Library + “Chat with Evidence”
- Reports and digitized documents are stored in **Storage** with metadata in **Firestore**.
- Gemini powers:
  - summarization
  - Q&A over a document
  - structured extraction for downstream workflows

## Data Model (Firestore collections — conceptual)
Exact names vary per route/service, but the system is centered around:
- `crises` / `incidents`: operational records, statuses, priority, location
- `volunteers`: profiles, skills, capacity, availability, location
- `assignments` / `tasks`: deployment records and task lifecycle
- `digitization_queue`: HITL queue for extracted/awaiting approval items
- `digitized_documents`: document metadata + links to Storage
- `verification_items`: items needing review and decision
- `globalConfig`: weights and AI configuration controls
- `chat_history`: document chat transcripts (where enabled)

## Tech Stack (By Layer)

### Web (Admin)
- React 18, TypeScript, Vite
- TailwindCSS + Radix UI
- TanStack React Query/Table
- Firebase Web SDK (Auth)
- Google Maps via `@react-google-maps/api`
- Zod, React Hook Form

Other notable libraries used in the app layer: `pdfjs-dist` (PDF parsing/rendering), `sonner` (toasts), and `lucide-react` (icons).

### Backend (API)
- Node.js + TypeScript (tsx), Express, CORS, dotenv
- Firebase Admin SDK (Auth verification)
- Firestore + Storage integrations
- PDF parsing via `pdfjs-dist`
- Upload handling via `multer`

Other notable libraries used in the API layer: `axios` (HTTP calls), `uuid` (IDs), and `zod` (runtime validation).

### Mobile (Volunteer)
- Flutter (Dart), provider, http, flutter_dotenv
- Firebase Core/Auth + Google Sign-In
- Google Maps Flutter

### ML (Fallback)
- Python: numpy, pandas, scikit-learn, joblib

## Google / Firebase Services Used (Exhaustive)

### Firebase
- **Firebase Authentication** (web + mobile)
- **Google Sign-In** (via Firebase Auth on web; `google_sign_in` on Flutter)
- **Firebase Admin SDK** (backend token verification, role claims)
- **Cloud Firestore** (core operational database)
- **Cloud Storage / Firebase Storage bucket** (documents and evidence media)

### Google Cloud AI
- **Document AI** (OCR + entity extraction for images/PDFs)
- **Gemini API / Generative Language API**
  - structured JSON extraction
  - verification & consistency checks
  - document summarization/Q&A
- **Vertex AI Prediction** (optional hosted ranking endpoint)

### Google Maps Platform
- **Maps JavaScript API** (web visualization)
- **Maps SDK for Flutter** (mobile maps)
- **Distance Matrix API** (travel time/ETA)
- **Geocoding API** + **Reverse Geocoding** (location normalization)

### Present as dependencies / planned usage
- **Cloud Vision** client library is included in backend dependencies; current verification flows primarily use Gemini (multimodal) in the active code paths.

## Configuration (What You Need to Run)
- Web: Firebase web config env vars + `VITE_GOOGLE_MAPS_API_KEY`
- Dev convenience: Vite proxies `/api` to the backend during local development.
- Backend: Firebase Admin credentials (service account), Firestore/Storage bucket, and keys for Document AI, Gemini, Maps; `DEV_MODE=true` bypass exists for development.
- Mobile: FlutterFire config targets the same Firebase project; `.env` is used for runtime config.

## Suggested Judge Demo (90 seconds)
1. Sign in as admin (web) and open the dashboard map.
2. Upload a photo/PDF report → watch it become structured + prioritized.
3. Review verification flags → approve the incident.
4. Open Matching Engine → show ranked volunteers + ETA.
5. Deploy a volunteer → switch to mobile and show the task appearing.

---
If you want, I can also add a one-page architecture diagram (Mermaid) and a “Google products mapping → SDGs + impact metrics” appendix for the submission form.
