// src/gemini.js
import { genAI, crisisSchema } from "./config.js";

/**
 * Extract structured data from raw text using Gemini AI
 * @param {string} rawText - Raw text from Document AI
 * @returns {Promise<Object>} Structured crisis data
 */
export async function extractStructuredData(rawText) {
  try {
    console.log("Calling Gemini AI for data extraction...");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: crisisSchema, // 2026 Pro Move: Schema-enforced response
      },
    });

    const prompt = `
You are an NGO crisis analysis system.

TASK:
Convert raw field report into STRICT JSON.

RULES:
- Only return valid JSON
- No explanation or markdown
- Categories allowed: ["Water", "Food", "Health", "Shelter", "Rescue"]
- Severity: 1-3 = LOW, 4-6 = MEDIUM, 7-10 = HIGH
- If people_affected is not mentioned, estimate based on context or omit
- Location should be the most specific location mentioned

OUTPUT FORMAT:
{
  "category": "Water",
  "severity": 9,
  "urgency": "HIGH",
  "people_affected": 120,
  "location_name": "Village A",
  "summary": "Severe water shortage affecting 120 people"
}

TEXT:
${rawText}
`;

    const response = await model.generateContent(prompt);
    const responseText = response.response.text();

    console.log("Gemini AI response received");

    // Parse the JSON response
    const structuredData = JSON.parse(responseText);

    // Map urgency based on severity if not provided
    if (!structuredData.urgency && structuredData.severity) {
      if (structuredData.severity >= 7) {
        structuredData.urgency = "HIGH";
      } else if (structuredData.severity >= 4) {
        structuredData.urgency = "MEDIUM";
      } else {
        structuredData.urgency = "LOW";
      }
    }

    return structuredData;
  } catch (error) {
    console.error("Gemini AI Error:", error.message);
    throw new Error(`Gemini AI extraction failed: ${error.message}`);
  }
}
