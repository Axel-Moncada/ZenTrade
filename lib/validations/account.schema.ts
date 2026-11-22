import { z } from "zod";

// Schema para crear cuenta
export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  account_type: z.enum(["evaluation", "live"], {
    errorMap: () => ({ message: "El tipo de cuenta debe ser 'evaluation' o 'live'" }),
  }),
  broker: z
    .string()
    .max(100, "El broker no puede exceder 100 caracteres")
    .optional(),
  platform: z
    .string()
    .max(100, "La plataforma no puede exceder 100 caracteres")
    .optional(),
  initial_balance: z
    .number()
    .positive("El balance inicial debe ser mayor a 0")
    .max(999999999999.99, "El balance inicial es demasiado grande"),
  starting_balance: z
    .number()
    .positive("El balance al iniciar tracking debe ser mayor a 0")
    .max(999999999999.99, "El balance al iniciar es demasiado grande"),
  drawdown_type: z.enum(["trailing", "static"], {
    errorMap: () => ({ message: "El tipo de drawdown debe ser 'trailing' o 'static'" }),
  }),
  max_drawdown: z
    .number()
    .positive("Max drawdown must be greater than 0")
    .max(999999999999.99, "Max drawdown is too large"),
  profit_target: z
    .number()
    .positive("El objetivo de ganancia debe ser mayor a 0")
    .max(999999999999.99, "El objetivo es demasiado grande")
    .optional()
    .nullable(),
  buffer_amount: z
    .number()
    .nonnegative("Buffer cannot be negative")
    .max(999999999999.99, "Buffer is too large")
    .optional()
    .nullable(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe estar en formato YYYY-MM-DD"),
  status: z
    .enum(["active", "passed", "failed", "inactive"], {
      errorMap: () => ({ 
        message: "El estado debe ser 'active', 'passed', 'failed' o 'inactive'" 
      }),
    })
    .default("active"),
  notes: z
    .string()
    .max(2000, "Las notas no pueden exceder 2000 caracteres")
    .optional()
    .nullable(),
  consistency_percent: z
    .number()
    .int("Percentage must be a whole number")
    .min(10, "Minimum is 10%")
    .max(100, "Maximum is 100%")
    .default(30),
}).refine(
  (data) => {
    // Validar que max_drawdown no sea mayor al initial_balance
    return data.max_drawdown <= data.initial_balance;
  },
  {
    message: "Max drawdown cannot exceed the starting balance",
    path: ["max_drawdown"],
  }
).refine(
  (data) => {
    // Validar que la fecha no sea futura
    const startDate = new Date(data.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return startDate <= today;
  },
  {
    message: "La fecha de inicio no puede ser futura",
    path: ["start_date"],
  }
);

// Schema para actualizar cuenta
export const updateAccountSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .optional(),
  account_type: z
    .enum(["evaluation", "live"])
    .optional(),
  broker: z
    .string()
    .max(100, "El broker no puede exceder 100 caracteres")
    .optional()
    .nullable(),
  platform: z
    .string()
    .max(100, "La plataforma no puede exceder 100 caracteres")
    .optional()
    .nullable(),
  initial_balance: z
    .number()
    .positive("El balance inicial debe ser mayor a 0")
    .max(999999999999.99, "El balance inicial es demasiado grande")
    .optional(),
  starting_balance: z
    .number()
    .positive("El balance al iniciar tracking debe ser mayor a 0")
    .max(999999999999.99, "El balance al iniciar es demasiado grande")
    .optional(),
  drawdown_type: z
    .enum(["trailing", "static"])
    .optional(),
  max_drawdown: z
    .number()
    .positive("Max drawdown must be greater than 0")
    .max(999999999999.99, "Max drawdown is too large")
    .optional(),
  profit_target: z
    .number()
    .positive("El objetivo de ganancia debe ser mayor a 0")
    .max(999999999999.99, "El objetivo es demasiado grande")
    .optional()
    .nullable(),
  buffer_amount: z
    .number()
    .nonnegative("Buffer cannot be negative")
    .max(999999999999.99, "Buffer is too large")
    .optional()
    .nullable(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe estar en formato YYYY-MM-DD")
    .optional(),
  status: z
    .enum(["active", "passed", "failed", "inactive"])
    .optional(),
  notes: z
    .string()
    .max(2000, "Las notas no pueden exceder 2000 caracteres")
    .optional()
    .nullable(),
  consistency_percent: z
    .number()
    .int("Percentage must be a whole number")
    .min(10, "Minimum is 10%")
    .max(100, "Maximum is 100%")
    .optional(),
}).refine(
  (data) => {
    // Validar que max_drawdown no sea mayor al initial_balance si ambos están presentes
    if (data.max_drawdown !== undefined && data.initial_balance !== undefined) {
      return data.max_drawdown <= data.initial_balance;
    }
    return true;
  },
  {
    message: "Max drawdown cannot exceed the starting balance",
    path: ["max_drawdown"],
  }
).refine(
  (data) => {
    // Validar que la fecha no sea futura si está presente
    if (data.start_date) {
      const startDate = new Date(data.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return startDate <= today;
    }
    return true;
  },
  {
    message: "La fecha de inicio no puede ser futura",
    path: ["start_date"],
  }
);

// Type inference
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
