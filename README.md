<img width="1333" height="315" alt="gsc2026" src="https://github.com/user-attachments/assets/c7a86eb2-7de8-48c4-8ce0-ea6b8fa7ae1b" />
<p align="center">
  <a href="https://youtu.be/-uq6juNzorg">
    <img src="https://img.shields.io/badge/Demo-Video-red?style=for-the-badge&logo=youtube" />
  </a>
  <a href="https://ngosynergy-gsc26.vercel.app/">
    <img src="https://img.shields.io/badge/Live-Link-blue?style=for-the-badge&logo=github" />
  </a>
</p>

# NGO Synergy — Smart Resource Allocation (GSC 2026)

## Why this directly fits the Problem Statement (PS)
The PS asks for a system that (1) **gathers scattered community information**, (2) **clearly shows the most urgent local needs**, and (3) **quickly matches volunteers** to the right tasks and locations.

NGO Synergy addresses this end-to-end:
- **Collect & unify** paper surveys/field reports (images, PDFs, free text) into one structured dataset.
- **Prioritize with clarity** using validated fields + an explainable priority score.
- **Match & dispatch fast** using skills + availability + distance/ETA, then deliver assignments to volunteers.

## What this project is
NGO Synergy is a unified crisis-response platform with:
- **Web Admin Console** (React) for triage, verification, matching, and operations.
- **Mobile Volunteer App** (Flutter) for sign-in, map context, and task execution.
- **One Backend API server** (Node/Express) that secures access, runs AI pipelines, and persists operational data.

Deep technical overview: see `Idea.md`.

## Key capabilities (judge-friendly)
- **Digitization**: Document AI OCR → Gemini schema-enforced JSON → validation → Firestore.
- **Verification Center**: AI-assisted checks + human-in-the-loop approval.
- **Matching Engine**: ranks volunteers and considers proximity/ETA for practical dispatch.
- **Maps**: web + mobile map views for incidents and coordination.
- **Document Library + Q&A**: store evidence and “chat” for summarization and retrieval.

## Google / Firebase services used
- **Firebase Authentication** (+ Google Sign-In)
- **Firebase Admin SDK** (server-side token verification, roles)
- **Cloud Firestore** (operational database)
- **Cloud Storage / Firebase Storage bucket** (documents/evidence)
- **Document AI** (OCR for PDFs/images)
- **Gemini API** (structured extraction, verification, document Q&A)
- **Vertex AI Prediction** (optional hosted ranking)
- **Google Maps Platform** (Maps JS API, Maps SDK for Flutter, Distance Matrix, Geocoding/Reverse Geocoding)

## Repo layout
- `src/` — Web Admin (React + Vite)
- `backend/` — Backend API (Express + TypeScript)
- `mobile_app/` — Flutter volunteer app
- `backend/Data Digitization Pipeline/` — standalone runnable pipeline demo (OCR → Gemini → validation → Firestore)

## Quickstart (local demo)

### Prerequisites
- Node.js 18+
- (Optional) Flutter SDK for `mobile_app/`
- (Optional) Python 3.x for the backend ML fallback scripts

### 1) Start web + backend
```bash
npm install
npm --prefix backend install
cp .env.example .env
cp backend/.env.example backend/.env
npm run dev:all
```

- Web: http://localhost:5173
- Backend: http://localhost:8080 (health: `/health`)
- Dev convenience: Vite proxies `/api` → `http://localhost:8080`

### 2) Auth notes (for judges)
- The backend supports a **development bypass**: set `DEV_MODE=true` in `backend/.env` to skip token verification.
- For a full end-to-end run, configure Firebase Admin + API keys in `backend/.env` (copy from `backend/.env.example`).

### 3) Run the mobile app (optional)
Copy the mobile env template:
```bash
cp mobile_app/.env.example mobile_app/.env
```
`mobile_app/.env.example` uses `10.0.2.2` (Android emulator → host loopback). Use your machine IP for a physical device.

Then:
```bash
cd mobile_app
flutter pub get
flutter run
```

## Scripts
- Root: `npm run dev` (web), `npm run dev:all` (web + backend)
- Backend: `npm --prefix backend run dev`

<br/>

<sup>
NOTE: 
<br/>
This project was developed using Antigravity as an AI-assisted development environment.
<br/>
Cursor was used only for generating the Graphify knowledge base (code indexing and navigation), not for application logic.
</sup>

## License
Internal use (hackathon prototype)
