# NGO Synergy Backend

Production-ready Node.js/Express API for NGO crisis response coordination platform with Google AI services integration.

## Features

- **Dual-Mode AI Engine**: PoC (local scikit-learn) + Pro (Vertex AI)
- **Gemini 1.5 Flash**: Photo authenticity verification for crisis reports
- **Google Document AI**: Field survey digitization and OCR extraction
- **Google Maps**: Proximity-based volunteer filtering
- **Firestore**: Real-time incident and volunteer data
- **Hybrid Matching**: Fast math filtering + ML-powered ranking
- **TypeScript**: Full type safety across API

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.8+ (for ML mode)
- Firebase project with Admin SDK credentials
- Google Cloud project with APIs enabled:
  - Vertex AI
  - Document AI
  - Gemini API
  - Maps API

### Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in all required credentials

# For PoC mode (local ML model):
# 1. Generate training data
python ml/generate_training_data.py

# 2. Train the model
python ml/train_model.py

# 3. Start backend
npm run dev
```

### Environment Variables

```env
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./firebase-credentials.json

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Document AI
DOCUMENT_AI_PROJECT_ID=your-project-id
DOCUMENT_AI_LOCATION=us
DOCUMENT_AI_PROCESSOR_ID=your-processor-id

# Google Maps
GOOGLE_MAPS_API_KEY=your-maps-api-key

# Vertex AI (Pro mode)
USE_VERTEX_AI=false  # Set to true for production
VERTEX_AI_ENDPOINT_ID=your-endpoint-id
VERTEX_AI_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1

# Server
PORT=8080
NODE_ENV=development
```

## API Endpoints

### Public Endpoints

```
POST /api/reports/submit
  - Submit crisis report with photo
  - Returns: { incidentId, verification }

GET /api/reports/public
  - Get public reports for community verification
  - Returns: [ { id, category, location, ... } ]
```

### Protected Endpoints (Admin)

```
POST /api/match/calculate
  - Calculate volunteer matches for incident
  - Body: { incidentId }
  - Returns: { matches, totalProcessed }

POST /api/match/deploy
  - Deploy volunteer to incident
  - Body: { incidentId, volunteerId }
  - Returns: { success, assignmentId }

PATCH /api/admin/weights
  - Update AI weights configuration
  - Body: { weights: { skillMatch, proximity, reliability, certification } }

PATCH /api/admin/model
  - Switch between PoC and Vertex AI modes
  - Body: { useVertexAI, endpointId }

POST /api/digitization/upload
  - Upload document for digitization
  - Body: { imageUrl, filename }

POST /api/verification/analyze
  - Analyze report with Gemini vision
  - Body: { reportText, photoUrl }
```

## Architecture

### Volunteer Matching Flow

1. **Phase 1: Fast Filtering**
   - Proximity filter (30 km radius using Haversine)
   - Skill matching
   - Quick weighted scoring

2. **Phase 2: AI Ranking**
   - PoC Mode: Local scikit-learn RandomForest model
   - Pro Mode: Vertex AI endpoint prediction
   - Returns confidence scores

3. **Output**
   - Top 10 ranked volunteers with reasoning
   - Priority confidence (0-100%)

### ML Model

**Feature Engineering** (Phase 1 hardcoding):
- Skill Match Score (40% weight)
- Proximity Factor (30% weight) 
- Reliability Rating (20% weight)
- Certification Status (10% weight)

**Training Data** (synthetic):
- 1000+ samples with realistic correlations
- Binary classification (High/Low priority)
- Accuracy: ~85%

## Deployment

### Local Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Docker (Cloud Run)

```bash
docker build -f backend/Dockerfile -t ngo-synergy-backend .
docker run -p 8080:8080 \
  -e FIREBASE_PROJECT_ID=xxx \
  -e GEMINI_API_KEY=xxx \
  -e GOOGLE_MAPS_API_KEY=xxx \
  ngo-synergy-backend
```

## Integration with Frontend

Frontend expects these endpoints to be available at `http://localhost:8080/api`:

```typescript
// Example: Calculate matches
const response = await fetch('/api/match/calculate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ incidentId: '123' })
})
```

## Google Services Integration

### Gemini 1.5 Flash (Photo Verification)

```typescript
// Automatic verification on report submission
- Checks for AI generation
- Detects tampering/filters
- Returns confidence score
- Rejects if confidence < 40%
```

### Document AI (Digitization)

```typescript
// Extracts structured data from handwritten surveys
- Incident Type
- Location
- Date
- Severity Level
- Reporter Name
- Description
- Affected Count
```

### Vertex AI (Pro Mode)

```typescript
// Scales matching from PoC to enterprise
- AutoML tabular training
- REST endpoint prediction
- A/B testing between models
- Performance monitoring
```

## Development

### Scripts

```bash
# Development
npm run dev          # Watch mode

# Build
npm run build        # Compile TypeScript

# ML Training
npm run ml:train     # Generate data + train model
npm run ml:test      # Test model predictions

# Linting
npm run lint         # Check TypeScript

# Testing
npm test             # Run tests
```

### Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Express app entry
│   ├── middleware/
│   │   └── authMiddleware.ts    # Firebase token verification
│   ├── services/
│   │   ├── firebaseService.ts   # Firestore operations
│   │   ├── geminiService.ts     # Gemini verification
│   │   ├── documentAiService.ts # Document extraction
│   │   ├── aiService.ts         # PoC/Vertex AI ranking
│   │   ├── geoService.ts        # Distance & filtering
│   │   └── matchingService.ts   # Matching engine
│   ├── routes/
│   │   ├── reports.ts           # Crisis report endpoints
│   │   ├── match.ts             # Matching engine endpoints
│   │   ├── admin.ts             # Admin configuration
│   │   ├── digitization.ts      # Document digitization
│   │   └── verification.ts      # Report verification
│   ├── schemas/
│   │   └── index.ts             # Zod validation schemas
│   └── types/
│       └── index.ts             # TypeScript types
├── ml/
│   ├── generate_training_data.py
│   ├── train_model.py
│   ├── predictor.py
│   └── test_predictions.py
├── Dockerfile
└── package.json
```

## Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "details": {}
}
```

## Performance Considerations

- Haversine distance: O(1) per volunteer
- Matching calculation: ~100ms for 500 volunteers
- Gemini verification: ~2-3 seconds per photo
- Vertex AI prediction: Configurable latency

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Batch volunteer deployment
- [ ] ML model retraining pipeline
- [ ] Analytics dashboard backend
- [ ] Multi-language support for OCR
- [ ] SMS/Push notifications
