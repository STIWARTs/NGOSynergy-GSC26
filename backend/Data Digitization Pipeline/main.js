// src/main.js
import { extractText } from "./digitize.js";
import { preprocess, enhanceText } from "./preprocess.js";
import { extractStructuredData } from "./gemini.js";
import { validateData, transformData } from "./validate.js";
import { saveToDB } from "./db.js";
import { categoryWeights } from "./config.js";

/**
 * Main pipeline function to process crisis reports
 * @param {Buffer} documentBuffer - Document buffer (image or PDF)
 * @param {string} filename - Optional filename for MIME type detection
 * @returns {Promise<Object>} Processed report with ID and data
 */
export async function processReport(documentBuffer, filename = "") {
  try {
    console.log("\nStarting Data Digitization Pipeline...\n");

    // Step 1: OCR with Document AI
    console.log("Step 1: Extracting text with Document AI...");
    const { text, entities, metadata } = await extractText(
      documentBuffer,
      filename
    );

    // Step 2: Preprocess and enhance text
    console.log("Step 2: Preprocessing text...");
    const { text: cleanText, metadata: preprocessMetadata } = enhanceText(
      text,
      entities
    );

    // Step 3: AI extraction with Gemini
    console.log("Step 3: Extracting structured data with Gemini AI...");
    const structured = await extractStructuredData(cleanText);

    // Step 4: Validate data
    console.log("Step 4: Validating data...");
    const validData = validateData(structured);

    // Step 5: Transform with priority score calculation
    console.log("Step 5: Calculating priority score...");
    const finalData = transformData(validData, categoryWeights);

    // Step 6: Save to Firestore
    console.log("Step 6: Saving to database...");
    const id = await saveToDB(finalData, text);

    console.log("\nPipeline completed successfully!\n");

    return {
      id,
      data: finalData,
      metadata: {
        ocr: metadata,
        preprocessing: preprocessMetadata,
      },
    };
  } catch (error) {
    console.error("\nPipeline failed:", error.message);
    throw error;
  }
}

/**
 * Alternative: Process text directly (bypass OCR)
 * Useful for testing or when text is already extracted
 * @param {string} rawText - Raw text to process
 * @returns {Promise<Object>} Processed report with ID and data
 */
export async function processText(rawText) {
  try {
    console.log("\nStarting Text Processing Pipeline...\n");

    // Step 1: Preprocess text
    console.log("Step 1: Preprocessing text...");
    const { text: cleanText } = enhanceText(rawText);

    // Step 2: AI extraction with Gemini
    console.log("Step 2: Extracting structured data with Gemini AI...");
    const structured = await extractStructuredData(cleanText);

    // Step 3: Validate data
    console.log("Step 3: Validating data...");
    const validData = validateData(structured);

    // Step 4: Transform with priority score
    console.log("Step 4: Calculating priority score...");
    const finalData = transformData(validData, categoryWeights);

    // Step 5: Save to Firestore
    console.log("Step 5: Saving to database...");
    const id = await saveToDB(finalData, rawText);

    console.log("\nText processing completed successfully!\n");

    return {
      id,
      data: finalData,
    };
  } catch (error) {
    console.error("\nText processing failed:", error.message);
    throw error;
  }
}

// Export individual modules for testing
export { extractText, extractEntities, detectMimeType } from "./digitize.js";
export { preprocess, enhanceText, normalizeCategory, extractNumbers, extractLocationHints, fixOCRErrors } from "./preprocess.js";
export { extractStructuredData } from "./gemini.js";
export { validateData, transformData } from "./validate.js";
export { saveToDB, getFromDB, getAllFromDB, updateInDB } from "./db.js";
export { config, categoryWeights, categoryMap } from "./config.js";
