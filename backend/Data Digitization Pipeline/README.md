# Data Digitization Pipeline

A complete data digitization pipeline for NGO crisis management that converts raw field reports (images, PDFs, text) into structured JSON data using Google Cloud AI services.

## 🎯 Features

- **Document AI (OCR)**: Extract text from images and PDFs
- **Intelligent Preprocessing**: Clean and normalize text with category detection
- **Gemini AI**: Extract structured crisis data with schema enforcement
- **Validation**: Zod-based validation for data integrity
- **Firestore Integration**: Store and query crisis reports
- **Priority Scoring**: Automatic urgency calculation based on category and severity

## 📁 Project Structure

```
Data Digitization Pipeline/
├── config.js          # Configuration and Gemini schema
├── digitize.js        # Document AI OCR extraction
├── preprocess.js      # Text cleaning and enhancement
├── gemini.js          # Gemini AI structured data extraction
├── validate.js        # Zod validation and data transformation
├── db.js              # Firestore database operations
├── main.js            # Main pipeline orchestrator
├── test.js            # Test script
├── .env               # Environment variables
└── package.json       # Dependencies
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update the `.env` file with your Google Cloud credentials:

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
DOCUMENT_AI_PROCESSOR_ID=your-processor-id
DOCUMENT_AI_LOCATION=us
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run Tests

```bash
npm test
```

### 4. Use the Pipeline

#### Option A: Process Documents (Images/PDFs)

```javascript
import { processReport } from "./main.js";
import fs from "fs";

const imageBuffer = fs.readFileSync("report.jpg");
const result = await processReport(imageBuffer, "report.jpg");

console.log(result.data);
// {
//   category: "Water",
//   severity: 9,
//   urgency: "HIGH",
//   people_affected: 120,
//   location_name: "Village A",
//   summary: "Severe water shortage...",
//   priorityScore: 7.5
// }
```

#### Option B: Process Text Directly

```javascript
import { processText } from "./main.js";

const text = "Emergency: Water shortage in Village B affecting 50 people...";
const result = await processText(text);

console.log(result.data);
```

## 📊 Pipeline Flow

```
[ Input: Image/PDF/Text ]
        ↓
[ Document AI (OCR) ] ← Only for images/PDFs
        ↓
[ Preprocessing ]
  - Clean text
  - Detect categories
  - Extract metadata
        ↓
[ Gemini AI ]
  - Schema-enforced JSON
  - Structured extraction
        ↓
[ Validation (Zod) ]
  - Schema validation
  - Error handling
        ↓
[ Priority Calculation ]
  - Category weights
  - Severity scoring
        ↓
[ Firestore Database ]
  - Store report
  - Enable queries
```

## 🔧 API Reference

### Main Functions

#### `processReport(documentBuffer, filename)`
Process an image or PDF document through the full pipeline.

**Parameters:**
- `documentBuffer` (Buffer): Document file buffer
- `filename` (string): Optional filename for MIME type detection

**Returns:** Promise<Object> with id, data, and metadata

#### `processText(rawText)`
Process raw text through the pipeline (bypasses OCR).

**Parameters:**
- `rawText` (string): Raw text to process

**Returns:** Promise<Object> with id and data

### Module Functions

#### digitize.js
- `extractText(buffer, filename)` - Extract text using Document AI
- `detectMimeType(buffer, filename)` - Auto-detect file type
- `extractEntities(entities)` - Parse Document AI entities

#### preprocess.js
- `preprocess(text)` - Clean and normalize text
- `enhanceText(rawText, entities)` - Enhanced preprocessing with metadata
- `normalizeCategory(text)` - Detect crisis category
- `extractNumbers(text)` - Extract numbers from text
- `extractLocationHints(text)` - Extract location names
- `fixOCRErrors(text)` - Fix common OCR mistakes

#### gemini.js
- `extractStructuredData(rawText)` - Extract JSON using Gemini AI

#### validate.js
- `validateData(data)` - Validate against Zod schema
- `transformData(validatedData, weights)` - Add priority score

#### db.js
- `saveToDB(data, rawText)` - Save crisis report
- `getFromDB(id)` - Get report by ID
- `getAllFromDB(filters)` - Query reports with filters
- `updateInDB(id, updates)` - Update report

## 🎯 Priority Score Calculation

The pipeline calculates a priority score to help administrators identify the most urgent crises:

```javascript
priorityScore = (categoryWeight * 0.5) + (severity * 0.5)
```

**Category Weights:**
- Health: 10
- Rescue: 8
- Water: 6
- Food: 5
- Shelter: 4

**Example:**
- Category: Health (10), Severity: 9
- Priority Score: (10 * 0.5) + (9 * 0.5) = 9.5

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The test script includes:
1. Text preprocessing validation
2. Category normalization checks
3. Text enhancement with metadata
4. Full pipeline test (requires valid .env)

To test the full pipeline with AI services:
1. Update `.env` with valid credentials
2. Uncomment the `processText()` call in `test.js`
3. Run `npm test`

## 📝 Example Output

```json
{
  "id": "abc123xyz",
  "data": {
    "category": "Water",
    "severity": 9,
    "urgency": "HIGH",
    "people_affected": 120,
    "location_name": "Village A",
    "summary": "Severe water shortage affecting 120 people",
    "priorityScore": 7.5,
    "status": "pending",
    "createdAt": "2026-04-23T10:30:00.000Z"
  },
  "metadata": {
    "ocr": {
      "mimeType": "image/jpeg",
      "pages": 1,
      "confidence": 0.95
    },
    "preprocessing": {
      "originalLength": 650,
      "cleanedLength": 640,
      "wordCount": 96,
      "detectedCategory": "Water",
      "extractedNumbers": [120, 45, 8]
    }
  }
}
```

## 🔑 Google Cloud Setup

### 1. Create a Google Cloud Project
Visit [Google Cloud Console](https://console.cloud.google.com)

### 2. Enable APIs
- Document AI API
- Vertex AI API (for Gemini)
- Firestore API

### 3. Create Service Account
1. Go to IAM → Service Accounts
2. Create a new service account
3. Grant roles:
   - Document AI User
   - Firestore User
4. Download JSON key file

### 4. Create Document AI Processor
1. Go to Document AI
2. Create a "Form Parser" processor
3. Copy the Processor ID

### 5. Get Gemini API Key
1. Go to Vertex AI
2. Enable Gemini API
3. Generate API key

## 🛠️ Technologies

- **Node.js** (v18+)
- **Google Document AI** - OCR and document understanding
- **Google Gemini AI** - Structured data extraction
- **Firestore** - NoSQL database
- **Zod** - TypeScript-first schema validation
- **dotenv** - Environment variable management

## 📚 Implementation Details

### 2026 Best Practices Applied

1. **Schema-Enforced Gemini Responses**
   - Uses `responseSchema` for guaranteed JSON structure
   - Prevents parsing errors and hallucinations

2. **Automatic MIME Type Detection**
   - Magic number detection for accurate file type identification
   - Supports JPEG, PNG, PDF, and TIFF

3. **Category Normalization**
   - Maps varied terminology to standard categories
   - Ensures consistent data across reports

4. **Priority Scoring**
   - Combines category importance with severity
   - Enables smart sorting in admin dashboard

5. **Comprehensive Validation**
   - Zod schemas for runtime validation
   - Detailed error messages for debugging

## 🐛 Troubleshooting

### Common Issues

**"GOOGLE_APPLICATION_CREDENTIALS is not set"**
```bash
# Set the environment variable
export GOOGLE_APPLICATION_CREDENTIALS="./path/to/key.json"
```

**"Document AI extraction failed"**
- Verify processor ID is correct
- Check service account has Document AI User role
- Ensure file format is supported (JPEG, PNG, PDF, TIFF)

**"Gemini AI extraction failed"**
- Verify GEMINI_API_KEY is correct
- Check Vertex AI API is enabled
- Ensure prompt follows schema requirements

**"Failed to save to database"**
- Verify Firestore database is created
- Check service account has Firestore User role
- Ensure project ID is correct

## 📄 License

MIT License - Created for Google Solution Challenge 2026

## 👥 Author

Stiwart - GSC-Stiwart Team
