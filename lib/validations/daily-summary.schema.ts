import { z } from "zod";

// Schema para actualizar daily summary (notas y/o foto paths)
export const updateDailySummarySchema = z.object({
  notes: z
    .string()
    .max(2000, "Las notas no pueden exceder 2000 caracteres")
    .optional()
    .nullable(),
  micro_photo_path: z.string().max(500).optional().nullable(),
  macro_photo_path: z.string().max(500).optional().nullable(),
});

// Backwards-compat alias
export const updateDailySummaryNotesSchema = updateDailySummarySchema;

export type UpdateDailySummaryInput = z.infer<typeof updateDailySummarySchema>;
export type UpdateDailySummaryNotesInput = UpdateDailySummaryInput;
