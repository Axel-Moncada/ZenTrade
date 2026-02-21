import { z } from "zod";

// Schema para actualizar notas del daily summary
export const updateDailySummaryNotesSchema = z.object({
  notes: z
    .string()
    .max(2000, "Las notas no pueden exceder 2000 caracteres")
    .optional()
    .nullable(),
});

// Type inference
export type UpdateDailySummaryNotesInput = z.infer<typeof updateDailySummaryNotesSchema>;
