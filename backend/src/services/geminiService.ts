import axios from 'axios'

export const geminiService = {
  async verifyPhotoAuthenticity(imageUrl: string): Promise<{
    verified: boolean
    confidence: number
    reasoning: string
    suspiciousElements: string[]
  }> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        console.warn('Gemini API key not configured')
        return {
          verified: true,
          confidence: 50,
          reasoning: 'Verification skipped - API not configured',
          suspiciousElements: [],
        }
      }

      // Call Gemini API via REST endpoint
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are an expert fraud detection analyst for crisis management. Analyze this crisis/emergency photograph for authenticity.

Evaluate:
1. Image quality and metadata consistency
2. Signs of AI generation or manipulation
3. Contextual appropriateness for the reported crisis type
4. Presence of suspicious elements (watermarks, filters, obvious fakes)

Respond in JSON format:
{
  "verified": boolean,
  "confidence": 0-100 (percentage),
  "reasoning": "explanation",
  "suspiciousElements": ["element1", "element2"]
}`,
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: Buffer.from(await fetch(imageUrl).then((r) => r.arrayBuffer())).toString('base64'),
                  },
                },
              ],
            },
          ],
        }
      )

      const content = response.data?.contents?.[0]?.parts?.[0]?.text || '{}'
      const parsed = JSON.parse(content)

      return {
        verified: parsed.verified ?? true,
        confidence: parsed.confidence ?? 50,
        reasoning: parsed.reasoning ?? 'Unable to verify',
        suspiciousElements: parsed.suspiciousElements ?? [],
      }
    } catch (error) {
      console.error('Gemini verification error:', error)
      return {
        verified: false,
        confidence: 0,
        reasoning: 'Verification service unavailable',
        suspiciousElements: [],
      }
    }
  },

  async analyzeVerificationReport(reportText: string, photoUrl: string): Promise<{
    authenticity: number
    description: string
    recommendations: string[]
  }> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        console.warn('Gemini API key not configured')
        return {
          authenticity: 50,
          description: 'Analysis skipped - API not configured',
          recommendations: [],
        }
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Analyze this crisis report for verification:

Report Text: "${reportText}"

Evaluate:
1. Narrative consistency with the image
2. Logical coherence of the incident description
3. Severity alignment with photo evidence
4. Geographic plausibility

Respond in JSON format:
{
  "authenticity": 0-100,
  "description": "analysis summary",
  "recommendations": ["action1", "action2"]
}`,
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: Buffer.from(await fetch(photoUrl).then((r) => r.arrayBuffer())).toString('base64'),
                  },
                },
              ],
            },
          ],
        }
      )

      const content = response.data?.contents?.[0]?.parts?.[0]?.text || '{}'
      const parsed = JSON.parse(content)

      return {
        authenticity: parsed.authenticity ?? 50,
        description: parsed.description ?? 'Analysis unavailable',
        recommendations: parsed.recommendations ?? [],
      }
    } catch (error) {
      console.error('Gemini analysis error:', error)
      return {
        authenticity: 50,
        description: 'Analysis unavailable',
        recommendations: [],
      }
    }
  },
}
