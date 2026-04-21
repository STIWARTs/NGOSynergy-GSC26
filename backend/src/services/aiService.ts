import { spawn } from 'child_process'
import { PredictionServiceClient } from '@google-cloud/aiplatform'
import { MatchResult } from '../types/index.js'

const predictionClient = new PredictionServiceClient()

export const aiService = {
  async rankVolunteers(
    candidates: Array<{
      id: string
      name: string
      skillScore: number
      proximityScore: number
      reliabilityScore: number
      certificationScore: number
      [key: string]: any
    }>,
    weights: { a: number; b: number; c: number; d: number }
  ): Promise<MatchResult[]> {
    const useVertexAI = process.env.USE_VERTEX_AI === 'true'

    if (useVertexAI) {
      return aiService.rankWithVertexAI(candidates, weights)
    } else {
      return aiService.rankWithLocalModel(candidates, weights)
    }
  },

  async rankWithLocalModel(
    candidates: Array<any>,
    weights: { a: number; b: number; c: number; d: number }
  ): Promise<MatchResult[]> {
    try {
      // Prepare feature vectors for Python model
      const features = candidates.map((c) => ({
        skill_match_score: c.skillScore,
        distance_km: c.distance || 5,
        availability_hrs: c.availability || 24,
        reliability_rating: c.reliabilityScore,
        is_certified: c.certificationScore > 0 ? 1 : 0,
      }))

      return new Promise((resolve, reject) => {
        const python = spawn('python', [
          process.env.ML_PREDICTOR_PATH || './backend/ml/predictor.py',
        ])

        let predictions = ''
        let errorOutput = ''

        python.stdout?.on('data', (data) => {
          predictions += data.toString()
        })

        python.stderr?.on('data', (data) => {
          errorOutput += data.toString()
        })

        python.on('close', (code) => {
          if (code !== 0) {
            console.error('Python error:', errorOutput)
            // Fallback to weighted scoring
            const ranked = candidates
              .map((c) => ({
                ...c,
                priorityConfidence:
                  (c.skillScore * weights.a +
                    c.proximityScore * weights.b +
                    c.reliabilityScore * weights.c +
                    c.certificationScore * weights.d) *
                  100,
              }))
              .sort((a, b) => b.priorityConfidence - a.priorityConfidence)

            resolve(ranked)
          } else {
            try {
              const parsed = JSON.parse(predictions)
              const ranked = candidates
                .map((c, i) => ({
                  ...c,
                  priorityConfidence: (parsed[i]?.score || 0) * 100,
                }))
                .sort((a, b) => b.priorityConfidence - a.priorityConfidence)

              resolve(ranked)
            } catch (e) {
              reject(e)
            }
          }
        })

        python.stdin?.write(JSON.stringify(features))
        python.stdin?.end()
      })
    } catch (error) {
      console.error('Local model ranking error:', error)
      throw error
    }
  },

  async rankWithVertexAI(
    candidates: Array<any>,
    weights: { a: number; b: number; c: number; d: number }
  ): Promise<MatchResult[]> {
    try {
      const projectId = process.env.VERTEX_AI_PROJECT_ID
      const location = process.env.VERTEX_AI_LOCATION || 'us-central1'
      const endpointId = process.env.VERTEX_AI_ENDPOINT_ID

      if (!projectId || !endpointId) {
        console.warn('Vertex AI not configured, using local weights')
        return candidates.map((c) => ({
          ...c,
          priorityConfidence:
            (c.skillScore * weights.a +
              c.proximityScore * weights.b +
              c.reliabilityScore * weights.c +
              c.certificationScore * weights.d) *
            100,
        }))
      }

      const endpoint = `projects/${projectId}/locations/${location}/endpoints/${endpointId}`

      // Prepare instances for prediction
      const instances = candidates.map((c) => ({
        skill_match_score: [c.skillScore],
        distance_km: [c.distance || 5],
        availability_hrs: [c.availability || 24],
        reliability_rating: [c.reliabilityScore],
        is_certified: [c.certificationScore > 0 ? 1 : 0],
      }))

      const request = {
        endpoint,
        instances,
      }

      const [response] = await predictionClient.predict(request as any)

      // Extract prediction results
      const ranked = candidates
        .map((c, i) => {
          const predictions = response.predictions?.[i] as any
          const confidence = predictions?.predictions?.[0]?.[1] || 0

          return {
            ...c,
            priorityConfidence: confidence * 100,
          }
        })
        .sort((a, b) => b.priorityConfidence - a.priorityConfidence)

      return ranked
    } catch (error) {
      console.error('Vertex AI ranking error:', error)
      throw error
    }
  },
}
