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
 * Transform and enrich validated data with priority score
 * @param {Object} validatedData - Validated crisis data
 * @param {Object} weights - Category weights mapping
 * @returns {Object} Enriched crisis data
 */
export function transformData(validatedData, weights) {
  const categoryWeight = weights[validatedData.category] || 5;
  const priorityScore =
    categoryWeight * 0.5 + validatedData.severity * 0.5;

  return {
    ...validatedData,
    priorityScore: Math.round(priorityScore * 100) / 100, // Round to 2 decimals
    status: "pending",
    createdAt: new Date(),
  };
}
