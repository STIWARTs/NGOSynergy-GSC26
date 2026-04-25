// src/validate.js
import { z } from "zod";

// Zod schema for crisis data validation
export const crisisSchema = z.object({
  category: z
    .string()
    .refine(
      (val) => ["Water", "Food", "Health", "Shelter", "Rescue"].includes(val),
      {
        message:
          "Category must be one of: Water, Food, Health, Shelter, Rescue",
      }
    ),
  severity: z.number().min(1).max(10, "Severity must be between 1 and 10"),
  urgency: z
    .string()
    .refine((val) => ["LOW", "MEDIUM", "HIGH"].includes(val), {
      message: "Urgency must be one of: LOW, MEDIUM, HIGH",
    }),
  people_affected: z.number().optional(),
  location_name: z.string().min(1, "Location name is required"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
});

// Schema for validated crisis data
export const validatedCrisisSchema = crisisSchema.extend({
  priorityScore: z.number().optional(),
  status: z.string().default("pending"),
  createdAt: z.date().optional(),
  originalText: z.string().optional(),
});

/**
 * Validate crisis data against schema
 * @param {Object} data - Raw data from Gemini AI
 * @returns {Object} Validated data
 */
export function validateData(data) {
  try {
    const validated = crisisSchema.parse(data);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      throw new Error(
        `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(", ")}`
      );
    }
    throw error;
  }
}

/**
 * Calculate scale factor based on number of people affected
 * Uses logarithmic scaling to convert large numbers to 0-10 range
 * @param {number} peopleAffected - Number of people affected
 * @returns {number} Scale factor (0-10)
 */
function calculateScaleFactor(peopleAffected) {
  if (!peopleAffected || peopleAffected <= 0) return 0;
  
  // Formula: min(log10(people_affected + 1) * 2.5, 10)
  // This ensures:
  // - 1 person → 0.75
  // - 10 people → 2.5
  // - 100 people → 5.0
  // - 1000 people → 7.5
  // - 10000+ people → 10 (capped)
  const scaleFactor = Math.log10(peopleAffected + 1) * 2.5;
  return Math.min(scaleFactor, 10);
}

/**
 * Calculate wait time factor based on hours pending
 * Priority increases over time to ensure no crisis is forgotten
 * @param {Date} createdAt - When the crisis was created
 * @returns {number} Wait time factor (0-10)
 */
function calculateWaitTimeFactor(createdAt) {
  if (!createdAt) return 0;
  
  const now = new Date();
  const hoursPending = (now - createdAt) / (1000 * 60 * 60); // Convert ms to hours
  
  // Linear growth: 1 point per 4 hours, capped at 10 (40 hours = 10 points)
  // After 48 hours, any crisis gets maximum wait time boost
  const waitTimeFactor = hoursPending / 4;
  return Math.min(waitTimeFactor, 10);
}

/**
 * Transform and enrich validated data with PRO priority score
 * Implements the Hybrid Pro Formula for Solution Challenge 2026
 * 
 * Formula: PriorityScore = (Category × 0.4) + (Severity × 0.3) + (ScaleFactor × 0.2) + (WaitTime × 0.1)
 * 
 * @param {Object} validatedData - Validated crisis data
 * @param {Object} weights - Category weights mapping
 * @returns {Object} Enriched crisis data with detailed scoring breakdown
 */
export function transformData(validatedData, weights) {
  const categoryWeight = weights[validatedData.category] || 5;
  const severity = validatedData.severity;
  const scaleFactor = calculateScaleFactor(validatedData.people_affected);
  const waitTimeFactor = calculateWaitTimeFactor(validatedData.createdAt || new Date());
  
  // Pro Priority Formula with weighted components
  const priorityScore = 
    (categoryWeight * 0.4) +    // 40% - Crisis type importance
    (severity * 0.3) +          // 30% - AI-extracted severity
    (scaleFactor * 0.2) +       // 20% - Scale of impact (people affected)
    (waitTimeFactor * 0.1);     // 10% - Time-based escalation
  
  return {
    ...validatedData,
    priorityScore: Math.round(priorityScore * 100) / 100, // Round to 2 decimals
    priorityBreakdown: {
      categoryScore: Math.round(categoryWeight * 0.4 * 100) / 100,
      severityScore: Math.round(severity * 0.3 * 100) / 100,
      scaleScore: Math.round(scaleFactor * 0.2 * 100) / 100,
      waitTimeScore: Math.round(waitTimeFactor * 0.1 * 100) / 100,
    },
    people_affected: validatedData.people_affected || 0,
    scaleFactor: Math.round(scaleFactor * 100) / 100,
    waitTimeFactor: Math.round(waitTimeFactor * 100) / 100,
    status: "pending",
    createdAt: validatedData.createdAt || new Date(),
  };
}
