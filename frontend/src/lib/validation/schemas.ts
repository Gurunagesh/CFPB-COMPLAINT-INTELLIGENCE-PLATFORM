import { z } from "zod";

/**
 * Validation schemas matching backend constraints in Src/api/schemas.py
 */

export const productPredictionSchema = z.object({
  narrative: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(10, { message: "Complaint narrative must be at least 10 characters." })
        .max(20000, { message: "Complaint narrative cannot exceed 20,000 characters." })
    ),
  company: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: "Company name must be at least 2 characters." })
        .max(500, { message: "Company name cannot exceed 500 characters." })
    ),
});

export const triagePredictionSchema = z.object({
  narrative: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(10, { message: "Complaint narrative must be at least 10 characters." })
        .max(20000, { message: "Complaint narrative cannot exceed 20,000 characters." })
    ),
  company: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, { message: "Company name must be at least 2 characters." })
        .max(500, { message: "Company name cannot exceed 500 characters." })
    ),
  date_received: z
    .string()
    .min(1, { message: "Intake date received is required." })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please enter a valid ISO datetime format (e.g. YYYY-MM-DDTHH:MM).",
    }),
});

export const combinedPredictionSchema = triagePredictionSchema;

export type ProductFormValues = z.infer<typeof productPredictionSchema>;
export type TriageFormValues = z.infer<typeof triagePredictionSchema>;
export type CombinedFormValues = z.infer<typeof combinedPredictionSchema>;
