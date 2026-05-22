-- Elimina el CHECK constraint anterior en exit_reason (si existe) y crea uno correcto.
-- La migración 018 solo tenía comentarios y nunca aplicó nada.
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_exit_reason_check;

ALTER TABLE trades ADD CONSTRAINT trades_exit_reason_check
  CHECK (
    exit_reason IS NULL OR
    exit_reason IN ('take_profit', 'stop_loss', 'trailing', 'break_even', 'manual', 'timeout')
  );
