// src/config.js
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clear any existing env vars and load from THIS directory's .env file
delete process.env.GEMINI_API_KEY;
delete process.env.GOOGLE_CLOUD_PROJECT_ID;
delete process.env.DOCUMENT_AI_PROCESSOR_ID;

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

// Validate required environment variables
const requiredEnvVars = [
  "GOOGLE_CLOUD_PROJECT_ID",
  "DOCUMENT_AI_PROCESSOR_ID",
  "GEMINI_API_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set in .env file`);
  }
}

// Export configuration
export const config = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  location: process.env.DOCUMENT_AI_LOCATION || "us",
  processorId: process.env.DOCUMENT_AI_PROCESSOR_ID,
  geminiApiKey: process.env.GEMINI_API_KEY,
};

// Initialize Gemini AI
export const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Gemini Response Schema (2026 Pro Move - Schema-enforced JSON)
export const crisisSchema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["Water", "Food", "Health", "Shelter", "Rescue"],
      description: "Category of the crisis",
    },
    severity: {
      type: "number",
      description: "Severity level from 1-10",
    },
    urgency: {
      type: "string",
      enum: ["LOW", "MEDIUM", "HIGH"],
      description: "Urgency level",
    },
    people_affected: {
      type: "number",
      description: "Number of people affected",
    },
    location_name: {
      type: "string",
      description: "Name of the location",
    },
    summary: {
      type: "string",
      description: "Brief summary of the crisis",
    },
  },
  required: ["category", "severity", "urgency", "location_name", "summary"],
};

// Category weights for priority calculation
export const categoryWeights = {
  Health: 10,
  Rescue: 8,
  Water: 6,
  Food: 5,
  Shelter: 4,
};

// Category normalization map
export const categoryMap = {
  // Water-related
  "lack of water": "Water",
  "water shortage": "Water",
  "no water": "Water",
  "drinking water": "Water",
  "clean water": "Water",

  // Food-related
  "lack of food": "Food",
  "food shortage": "Food",
  "hunger": "Food",
  "starvation": "Food",
  "no food": "Food",

  // Health-related
  "medical": "Health",
  "hospital": "Health",
  "disease": "Health",
  "illness": "Health",
  "medicine": "Health",
  "doctor": "Health",

  // Shelter-related
  "housing": "Shelter",
  "homeless": "Shelter",
  "no shelter": "Shelter",
  "roof": "Shelter",

  // Rescue-related
  "emergency": "Rescue",
  "trapped": "Rescue",
  "rescue": "Rescue",
  "urgent": "Rescue",
};