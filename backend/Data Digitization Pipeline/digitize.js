// src/digitize.js
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { config } from "./config.js";

const client = new DocumentProcessorServiceClient();

/**
 * Detect MIME type from buffer or file extension
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Optional filename for extension detection
 * @returns {string} MIME type
 */
export function detectMimeType(buffer, filename = "") {
  // Check magic numbers (file signatures)
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44) {
    return "application/pdf";
  }

  // Fallback to extension
  if (filename) {
    const ext = filename.toLowerCase().split(".").pop();
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      pdf: "application/pdf",
      tiff: "image/tiff",
      tif: "image/tiff",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }

  return "application/octet-stream";
}

/**
 * Extract text from document using Google Document AI
 * @param {Buffer} documentBuffer - Document buffer (image or PDF)
 * @param {string} filename - Optional filename for MIME type detection
 * @returns {Promise<Object>} Extracted text and entities
 */
export async function extractText(documentBuffer, filename = "") {
  try {
    // Detect MIME type
    const mimeType = detectMimeType(documentBuffer, filename);

    console.log(`Processing document (${mimeType})...`);

    // Construct processor name
    const name = `projects/${config.projectId}/locations/${config.location}/processors/${config.processorId}`;

    // Call Document AI
    const [result] = await client.processDocument({
      name,
      rawDocument: {
        content: documentBuffer,
        mimeType: mimeType,
      },
    });

    const text = result.document.text || "";
    const entities = result.document.entities || [];

    console.log(`Extracted ${text.length} characters`);
    console.log(`Found ${entities.length} entities`);

    return {
      text,
      entities,
      metadata: {
        mimeType,
        pages: result.document.pages?.length || 0,
        confidence: calculateConfidence(result.document),
      },
    };
  } catch (error) {
    console.error("Document AI Error:", error.message);
    throw new Error(`Document AI extraction failed: ${error.message}`);
  }
}

/**
 * Calculate average confidence score from document
 * @param {Object} document - Document AI document object
 * @returns {number} Average confidence (0-1)
 */
function calculateConfidence(document) {
  if (!document.pages || document.pages.length === 0) return 0;

  let totalConfidence = 0;
  let count = 0;

  for (const page of document.pages) {
    if (page.tokens) {
      for (const token of page.tokens) {
        if (token.layout?.confidence) {
          totalConfidence += token.layout.confidence;
          count++;
        }
      }
    }
  }

  return count > 0 ? totalConfidence / count : 0;
}

/**
 * Extract structured entities from Document AI
 * @param {Array} entities - Document AI entities
 * @returns {Object} Structured entity data
 */
export function extractEntities(entities) {
  const structured = {
    locations: [],
    dates: [],
    numbers: [],
    organizations: [],
  };

  for (const entity of entities) {
    const type = entity.type?.toLowerCase() || "";
    const text = entity.mentionText || "";

    if (type.includes("location") || type.includes("address")) {
      structured.locations.push(text);
    } else if (type.includes("date") || type.includes("time")) {
      structured.dates.push(text);
    } else if (type.includes("number") || type.includes("quantity")) {
      structured.numbers.push(text);
    } else if (type.includes("organization") || type.includes("company")) {
      structured.organizations.push(text);
    }
  }

  return structured;
}
