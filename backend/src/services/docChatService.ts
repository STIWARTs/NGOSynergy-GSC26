/**
 * Document Chat Service — Gemini-powered chat about a specific digitized document
 * Uses the document's OCR text + metadata as context
 */

import axios from 'axios'
import { DigiDocument, ChatMessage } from './documentService.js'

const GEMINI_MODEL = 'gemini-2.0-flash'

/**
 * Build the system context for a document
 */
function buildDocumentContext(doc: DigiDocument): string {
  return `You are an expert NGO crisis analyst assistant. You have access to a digitized field report document that has been processed through our AI pipeline.

DOCUMENT METADATA:
- Filename: ${doc.filename}
- Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}
- Category: ${doc.category}
- Severity: ${doc.severity}/10
- Urgency: ${doc.urgency}
- People Affected: ${doc.people_affected.toLocaleString()}
- Location: ${doc.location_name}
- Priority Score: ${doc.priorityScore}/10
- Pipeline AI Summary: ${doc.summary}

FULL OCR TEXT FROM DOCUMENT:
${doc.ocrText}

Your role:
- Answer questions about this specific document and crisis situation
- Provide actionable recommendations for NGO response
- Summarize key facts clearly and concisely
- If asked for a summary, provide: situation overview, people affected, urgency, and recommended immediate actions
- Always reference specific details from the document when possible
- Be direct and professional — this is a crisis response context`
}

/**
 * Send a chat message to Gemini with full document context and history.
 * Returns the assistant's reply.
 */
export async function chatWithDocument(
  doc: DigiDocument,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.warn('[DocChat] Gemini API key not configured — returning mock response')
    return generateMockResponse(doc, userMessage)
  }

  // Build the conversation history for Gemini
  const systemContext = buildDocumentContext(doc)

  // Convert chat history to Gemini format (user/model alternating)
  const geminiHistory = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }))

  // Prepend system context as the first "user" turn with a model acknowledgement
  // Gemini 1.5 Flash supports system instructions via a separate field
  const requestBody = {
    system_instruction: {
      parts: [{ text: systemContext }],
    },
    contents: [
      ...geminiHistory,
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      requestBody
    )

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I could not generate a response. Please try again.'

    return reply.trim()
  } catch (error: any) {
    console.error('[DocChat] Gemini API error:', error.response?.data || error.message)
    throw new Error(`Gemini chat failed: ${error.response?.data?.error?.message || error.message}`)
  }
}

/**
 * Generate an auto-summary for when the document viewer opens
 */
export async function generateDocumentSummary(doc: DigiDocument): Promise<string> {
  return chatWithDocument(doc, [], 
    `Please provide a comprehensive summary of this document including: 
    1. The crisis situation overview
    2. Key statistics (people affected, severity, location)
    3. Urgency assessment  
    4. Recommended immediate actions for the NGO response team
    Keep it structured and actionable.`)
}

// ─── Mock fallback ─────────────────────────────────────────────────────────────

function generateMockResponse(doc: DigiDocument, question: string): string {
  const lower = question.toLowerCase()
  
  if (lower.includes('summar') || lower.includes('overview') || lower.includes('what')) {
    return `Based on the digitized document, this is a ${doc.urgency} urgency ${doc.category} crisis situation affecting ${doc.people_affected.toLocaleString()} people in ${doc.location_name}. The severity is rated ${doc.severity}/10 with a priority score of ${doc.priorityScore}. ${doc.summary} Immediate NGO response and resource deployment is recommended.`
  }
  if (lower.includes('how many') || lower.includes('people') || lower.includes('affected')) {
    return `According to the document, approximately ${doc.people_affected.toLocaleString()} people are affected in the ${doc.location_name} area. Given the ${doc.urgency} urgency level, immediate intervention is critical.`
  }
  if (lower.includes('location') || lower.includes('where')) {
    return `The crisis is located in ${doc.location_name}. This information was extracted from the field report via OCR and validated by the AI pipeline.`
  }
  if (lower.includes('action') || lower.includes('recommend') || lower.includes('do')) {
    return `Based on the ${doc.category} crisis with severity ${doc.severity}/10, I recommend: 1) Immediate deployment of ${doc.category.toLowerCase()} response teams to ${doc.location_name}, 2) Coordinate with local authorities for access, 3) Prepare resources for ${doc.people_affected.toLocaleString()} affected individuals, 4) Set up real-time status updates for field teams.`
  }
  return `This document covers a ${doc.category} crisis in ${doc.location_name} affecting ${doc.people_affected.toLocaleString()} people with a priority score of ${doc.priorityScore}. Is there a specific aspect of this crisis you'd like me to analyze further?`
}
