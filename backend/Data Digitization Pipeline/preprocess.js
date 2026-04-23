// src/preprocess.js
import { categoryMap } from "./config.js";

/**
 * Preprocess raw text for AI consumption
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned and normalized text
 */
export function preprocess(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  let cleaned = text
    // Convert to lowercase
    .toLowerCase()
    // Replace multiple newlines with single space
    .replace(/\n+/g, " ")
    // Replace multiple spaces with single space
    .replace(/\s+/g, " ")
    // Remove special characters but keep important punctuation
    .replace(/[^\w\s.,;:!?-]/g, "")
    // Trim whitespace
    .trim();

  return cleaned;
}

/**
 * Normalize category names using predefined mapping
 * @param {string} text - Text containing potential category keywords
 * @returns {string|null} Normalized category or null
 */
export function normalizeCategory(text) {
  const lowerText = text.toLowerCase();

  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (lowerText.includes(keyword)) {
      return category;
    }
  }

  return null;
}

/**
 * Extract numbers from text (useful for people_affected)
 * @param {string} text - Text containing numbers
 * @returns {number[]} Array of numbers found
 */
export function extractNumbers(text) {
  const numberPattern = /\b\d+\b/g;
  const matches = text.match(numberPattern);
  return matches ? matches.map((n) => parseInt(n, 10)) : [];
}

/**
 * Extract location hints from text
 * @param {string} text - Text containing location information
 * @returns {string[]} Array of potential location names
 */
export function extractLocationHints(text) {
  const locations = [];

  // Common location indicators
  const indicators = [
    /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    /at\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    /village\s+([A-Z])/gi,
    /city\s+of\s+([A-Z][a-z]+)/gi,
    /town\s+([A-Z][a-z]+)/gi,
  ];

  for (const pattern of indicators) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      if (match[1]) {
        locations.push(match[1].trim());
      }
    }
  }

  return [...new Set(locations)]; // Remove duplicates
}

/**
 * Clean and enhance text for better AI understanding
 * @param {string} rawText - Raw text from OCR
 * @param {Object} entities - Extracted entities from Document AI
 * @returns {Object} Enhanced text with metadata
 */
export function enhanceText(rawText, entities = {}) {
  const cleanText = preprocess(rawText);

  return {
    text: cleanText,
    metadata: {
      originalLength: rawText.length,
      cleanedLength: cleanText.length,
      wordCount: cleanText.split(/\s+/).length,
      detectedCategory: normalizeCategory(cleanText),
      extractedNumbers: extractNumbers(rawText),
      locationHints: entities.locations || extractLocationHints(rawText),
    },
  };
}

/**
 * Remove common OCR errors and artifacts
 * @param {string} text - Text with potential OCR errors
 * @returns {string} Corrected text
 */
export function fixOCRErrors(text) {
  return text
    // Fix common OCR misreads
    .replace(/\bl\b/g, "1") // Standalone 'l' often means '1'
    .replace(/\bO\b/g, "0") // Standalone 'O' often means '0'
    .replace(/\|/g, "I") // Vertical bar to capital I
    // Remove artifacts
    .replace(/[_]{3,}/g, " ") // Remove underscores (form fields)
    .replace(/[\.]{3,}/g, " ") // Remove multiple periods
    .replace(/[-]{3,}/g, " ") // Remove dashes (form lines)
    .trim();
}
