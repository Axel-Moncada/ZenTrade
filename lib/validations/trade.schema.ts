import { z } from 'zod';

// Schema para crear un trade
export const createTradeSchema = z.object({
  account_id: z.string().uuid('Invalid account ID'),
  instrument_id: z.string().uuid('Invalid instrument ID'),
  trade_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato YYYY-MM-DD'),
  contracts: z.number().int().positive('Contracts must be a positive number'),
  side: z.enum(['long', 'short'], {
    errorMap: () => ({ message: 'Lado debe ser "long" o "short"' })
  }),
  result: z.number({ required_error: 'El resultado es requerido' }),
  exit_reason: z.enum(['take_profit', 'stop_loss', 'trailing', 'break_even', 'manual', 'timeout'], {
    errorMap: () => ({ message: 'Invalid exit reason' })
  }).optional(),
  followed_plan: z.boolean().default(true),
  emotions: z.array(z.string()).optional(),
  notes: z.string().max(2000, 'Notas no pueden exceder 2000 caracteres').optional(),
  screenshot_url: z.string().url('Invalid screenshot URL').optional(),
  entry_time: z.string().regex(/^([01]\d|2[0-3]):[03]0$/, 'Invalid time').optional().nullable(),
  exit_time: z.string().regex(/^([01]\d|2[0-3]):[03]0$/, 'Invalid time').optional().nullable(),
  screenshot_urls: z.array(z.string()).max(3, 'Maximum 3 screenshots per trade').optional().nullable(),
});

// Schema para actualizar un trade
export const updateTradeSchema = z.object({
  instrument_id: z.string().uuid('Invalid instrument ID').optional(),
  trade_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato YYYY-MM-DD').optional(),
  contracts: z.number().int().positive('Contracts must be a positive number').optional(),
  side: z.enum(['long', 'short'], {
    errorMap: () => ({ message: 'Lado debe ser "long" o "short"' })
  }).optional(),
  result: z.number().optional(),
  exit_reason: z.enum(['take_profit', 'stop_loss', 'trailing', 'break_even', 'manual', 'timeout'], {
    errorMap: () => ({ message: 'Invalid exit reason' })
  }).optional().nullable(),
  followed_plan: z.boolean().optional(),
  emotions: z.array(z.string()).optional().nullable(),
  notes: z.string().max(2000, 'Notas no pueden exceder 2000 caracteres').optional().nullable(),
  screenshot_url: z.string().url('Invalid screenshot URL').optional().nullable(),
  entry_time: z.string().regex(/^([01]\d|2[0-3]):[03]0$/, 'Invalid time').optional().nullable(),
  exit_time: z.string().regex(/^([01]\d|2[0-3]):[03]0$/, 'Invalid time').optional().nullable(),
  screenshot_urls: z.array(z.string()).max(3, 'Maximum 3 screenshots per trade').optional().nullable(),
});

export type CreateTradeSchema = z.infer<typeof createTradeSchema>;
export type UpdateTradeSchema = z.infer<typeof updateTradeSchema>;
