-- Crear tabla de retiros
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  withdrawal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejor rendimiento
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_account_id ON withdrawals(account_id);
CREATE INDEX idx_withdrawals_date ON withdrawals(withdrawal_date);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- Trigger para updated_at
CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Los usuarios pueden ver sus propios retiros"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios retiros"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios retiros"
  ON withdrawals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios retiros"
  ON withdrawals FOR DELETE
  USING (auth.uid() = user_id);

-- Comentarios
COMMENT ON TABLE withdrawals IS 'Registro de retiros de cuentas de trading';
COMMENT ON COLUMN withdrawals.amount IS 'Monto del retiro en la moneda de la cuenta';
COMMENT ON COLUMN withdrawals.status IS 'Estado del retiro: pending, completed, cancelled';
COMMENT ON COLUMN withdrawals.notes IS 'Notas adicionales sobre el retiro';
