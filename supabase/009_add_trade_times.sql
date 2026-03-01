-- Migration 009: Add entry_time and exit_time to trades
-- These are approximate times stored as HH:MM (30-minute intervals)
-- Available for Professional and ZenMode plans

ALTER TABLE trades
  ADD COLUMN IF NOT EXISTS entry_time VARCHAR(5) CHECK (entry_time ~ '^\d{2}:\d{2}$'),
  ADD COLUMN IF NOT EXISTS exit_time  VARCHAR(5) CHECK (exit_time  ~ '^\d{2}:\d{2}$');

COMMENT ON COLUMN trades.entry_time IS 'Approximate entry time in HH:MM format (30-min intervals), Pro/ZenMode only';
COMMENT ON COLUMN trades.exit_time  IS 'Approximate exit time in HH:MM format (30-min intervals), Pro/ZenMode only';
