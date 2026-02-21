-- =====================================================
-- ZENTRADE - FASE 3: TRADES Y CÁLCULOS
-- Migration: 003_trades_setup.sql
-- =====================================================

-- =====================================================
-- 1. TABLA INSTRUMENT_SPECS
-- Especificaciones de instrumentos de futuros
-- =====================================================
CREATE TABLE IF NOT EXISTS instrument_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  tick_size DECIMAL(10,4) NOT NULL,
  tick_value DECIMAL(10,4) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insertar instrumentos comunes
INSERT INTO instrument_specs (symbol, name, tick_size, tick_value, category) VALUES
  ('MNQ', 'Micro E-mini Nasdaq-100', 0.25, 0.50, 'indices'),
  ('NQ', 'E-mini Nasdaq-100', 0.25, 5.00, 'indices'),
  ('MES', 'Micro E-mini S&P 500', 0.25, 1.25, 'indices'),
  ('ES', 'E-mini S&P 500', 0.25, 12.50, 'indices'),
  ('MYM', 'Micro E-mini Dow', 1.00, 0.50, 'indices'),
  ('YM', 'E-mini Dow', 1.00, 5.00, 'indices'),
  ('M2K', 'Micro E-mini Russell 2000', 0.10, 0.50, 'indices'),
  ('RTY', 'E-mini Russell 2000', 0.10, 5.00, 'indices'),
  ('MCL', 'Micro WTI Crude Oil', 0.01, 1.00, 'energy'),
  ('CL', 'WTI Crude Oil', 0.01, 10.00, 'energy'),
  ('MGC', 'Micro Gold', 0.10, 1.00, 'metals'),
  ('GC', 'Gold', 0.10, 10.00, 'metals')
ON CONFLICT (symbol) DO NOTHING;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_instrument_specs_symbol ON instrument_specs(symbol);
CREATE INDEX IF NOT EXISTS idx_instrument_specs_category ON instrument_specs(category);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_instrument_specs_updated_at
  BEFORE UPDATE ON instrument_specs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. TABLA TRADES
-- Registro de operaciones de trading
-- =====================================================
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instrument_specs(id) ON DELETE RESTRICT,
  trade_date DATE NOT NULL,
  contracts INTEGER NOT NULL CHECK (contracts > 0),
  side VARCHAR(10) NOT NULL CHECK (side IN ('long', 'short')),
  result DECIMAL(15,2) NOT NULL,
  exit_reason VARCHAR(20) CHECK (exit_reason IN ('take_profit', 'stop_loss', 'break_even', 'manual', 'timeout')),
  followed_plan BOOLEAN DEFAULT true,
  emotions TEXT[],
  notes TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_trades_user_account ON trades(user_id, account_id);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(user_id, trade_date);
CREATE INDEX IF NOT EXISTS idx_trades_account_date ON trades(account_id, trade_date);
CREATE INDEX IF NOT EXISTS idx_trades_instrument ON trades(instrument_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. FUNCIÓN: Actualizar daily_summary cuando cambian trades
-- =====================================================
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_account_id UUID;
  v_trade_date DATE;
BEGIN
  -- Obtener datos del trade (NEW para INSERT/UPDATE, OLD para DELETE)
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
    v_account_id := OLD.account_id;
    v_trade_date := OLD.trade_date;
  ELSE
    v_user_id := NEW.user_id;
    v_account_id := NEW.account_id;
    v_trade_date := NEW.trade_date;
  END IF;

  -- Recalcular summary para ese día
  INSERT INTO daily_summaries (
    user_id,
    account_id,
    summary_date,
    total_trades,
    winning_trades,
    losing_trades,
    gross_pnl,
    net_pnl,
    commissions
  )
  SELECT 
    v_user_id,
    v_account_id,
    v_trade_date,
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE result > 0)::INTEGER,
    COUNT(*) FILTER (WHERE result < 0)::INTEGER,
    COALESCE(SUM(result), 0),
    COALESCE(SUM(result), 0),
    0
  FROM trades
  WHERE user_id = v_user_id
    AND account_id = v_account_id
    AND trade_date = v_trade_date
  ON CONFLICT (user_id, account_id, summary_date)
  DO UPDATE SET
    total_trades = EXCLUDED.total_trades,
    winning_trades = EXCLUDED.winning_trades,
    losing_trades = EXCLUDED.losing_trades,
    gross_pnl = EXCLUDED.gross_pnl,
    net_pnl = EXCLUDED.net_pnl,
    commissions = EXCLUDED.commissions,
    updated_at = now();

  -- Si no hay trades para ese día, eliminar el summary
  DELETE FROM daily_summaries
  WHERE user_id = v_user_id
    AND account_id = v_account_id
    AND summary_date = v_trade_date
    AND total_trades = 0
    AND notes IS NULL;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. ACTIVAR TRIGGER: Actualizar daily_summary cuando cambian trades
-- =====================================================
CREATE TRIGGER trigger_update_daily_summary
  AFTER INSERT OR UPDATE OR DELETE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_summary();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en trades
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Políticas para trades
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- instrument_specs es de solo lectura para todos los usuarios autenticados
ALTER TABLE instrument_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view instrument specs"
  ON instrument_specs FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- FIN DE MIGRATION
-- =====================================================
