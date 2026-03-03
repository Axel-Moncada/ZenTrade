import { z } from 'zod';

// Schema para crear un trade
export const createTradeSchema = z.object({
  account_id: z.string().uuid('ID de cuenta inválido'),
  instrument_id: z.string().uuid('ID de instrumento inválido'),
  trade_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato YYYY-MM-DD'),
  contracts: z.number().int().positive('Contratos debe ser un número positivo'),
  side: z.enum(['long', 'short'], {
    errorMap: () => ({ message: 'Lado debe ser "long" o "short"' })
  }),
  result: z.number({ required_error: 'El resultado es requerido' }),
  exit_reason: z.enum(['take_profit', 'stop_loss', 'break_even', 'manual', 'timeout'], {
    errorMap: () => ({ message: 'Razón de salida inválida' })
  }).optional(),
  followed_plan: z.boolean().default(true),
  emotions: z.array(z.string()).optional(),
  notes: z.string().max(2000, 'Notas no pueden exceder 2000 caracteres').optional(),
  screenshot_url: z.string().url('URL de captura inválida').optional(),
  entry_time: z.string().regex(/^([01]\d|2[0-3]):[03]0$/, 'Hora inválida').optional().nullable(),
  exit_time: z.string().regex(/^([01]\d|2[0-3]):[03]0$/, 'Hora inválida').optional().nullable(),
  screenshot_urls: z.array(z.string()).max(3, 'Máximo 3 capturas por trade').optional().nullable(),
});

// Schema para actualizar un trade
export const updateTradeSchema = z.object({
  instrument_id: z.string().uuid('ID de instrumento inválido').optional(),
  trade_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato YYYY-MM-DD').optional(),
  contracts: z.number().int().positive('Contratos debe ser un número positivo').optional(),
  side: z.enum(['long', 'short'], {
    errorMap: () => ({ message: 'Lado debe ser "long" o "short"' })
  }).optional(),
  result: z.number().optional(),
  exit_reason: z.enum(['take_profit', 'stop_loss', 'break_even', 'manual', 'timeout'], {
    errorMap: () => ({ message: 'Razón de salida inválida' })
  }).optional().nullable(),
  followed_plan: z.boolean().optional(),
  emotions: z.array(z.string()).optional().nullable(),
  notes: z.string().max(2000, 'Notas no pueden exceder 2000 caracteres').optional().nullable(),
  screenshot_url: z.string().url('URL de captura inválida').optional().nullable(),
  entry_time: z.string().regex(/^([01]\d|2[0-3]):[03]0$/, 'Hora inválida').optional().nullable(),
  exit_time: z.string().regex(/^([01]\d|2[0-3]):[03]0$/, 'Hora inválida').optional().nullable(),
  screenshot_urls: z.array(z.string()).max(3, 'Máximo 3 capturas por trade').optional().nullable(),
});

export type CreateTradeSchema = z.infer<typeof createTradeSchema>;
export type UpdateTradeSchema = z.infer<typeof updateTradeSchema>;
