import { z } from 'zod'

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const ReportSubmissionSchema = z.object({
  category: z.string().min(1),
  severity: z.number().min(1).max(5),
  coordinates: CoordinatesSchema,
  photoUrl: z.string().url(),
  reporterName: z.string().optional(),
  description: z.string().optional(),
  affectedCount: z.number().optional(),
})

export const DigitizationUploadSchema = z.object({
  filename: z.string(),
  imageUrl: z.string().url(),
})

export const DigitizationCommitSchema = z.object({
  digitizationId: z.string(),
  extractedData: z.object({
    incidentType: z.string().optional(),
    location: z.string().optional(),
    date: z.string().optional(),
    severity: z.string().optional(),
    reporterName: z.string().optional(),
    description: z.string().optional(),
    affectedCount: z.string().optional(),
  }),
})

export const MatchCalculateSchema = z.object({
  incidentId: z.string(),
})

export const MatchDeploySchema = z.object({
  incidentId: z.string(),
  volunteerId: z.string(),
})

export const AIWeightsSchema = z.object({
  a: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  c: z.number().min(0).max(1),
  d: z.number().min(0).max(1),
})

export const UrgencyMultipliersSchema = z.object({
  impact: z.number().min(0).max(1),
  severity: z.number().min(0).max(1),
})

export type ReportSubmission = z.infer<typeof ReportSubmissionSchema>
export type DigitizationUpload = z.infer<typeof DigitizationUploadSchema>
export type MatchCalculate = z.infer<typeof MatchCalculateSchema>
export type AIWeights = z.infer<typeof AIWeightsSchema>
