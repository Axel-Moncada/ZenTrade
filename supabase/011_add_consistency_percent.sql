-- Migración: agregar consistency_percent a la tabla accounts
-- Permite que cada cuenta tenga su propia regla de consistencia configurable
-- Default: 30% (estándar FTMO)

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS consistency_percent INTEGER NOT NULL DEFAULT 30;

-- Constraint: entre 10% y 100%
ALTER TABLE accounts
  ADD CONSTRAINT accounts_consistency_percent_range
    CHECK (consistency_percent >= 10 AND consistency_percent <= 100);
