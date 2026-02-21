-- =====================================================
-- ZENTRADE - FASE 2: DAILY SUMMARIES
-- Migration: 002_daily_summaries.sql
-- =====================================================

-- =====================================================
-- 1. TABLA DAILY_SUMMARIES
-- Resumen diario de trading por cuenta
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  total_trades INTEGER DEFAULT 0 NOT NULL,
  winning_trades INTEGER DEFAULT 0 NOT NULL,
  losing_trades INTEGER DEFAULT 0 NOT NULL,
  gross_pnl DECIMAL(15,2) DEFAULT 0 NOT NULL,
  net_pnl DECIMAL(15,2) DEFAULT 0 NOT NULL,
  commissions DECIMAL(10,2) DEFAULT 0 NOT NULL,
  starting_balance DECIMAL(15,2),
  ending_balance DECIMAL(15,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Constraint: un summary por día por cuenta por usuario
  UNIQUE(user_id, account_id, summary_date)
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_account ON daily_summaries(user_id, account_id);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries(user_id, summary_date);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_account_date ON daily_summaries(account_id, summary_date);

-- =====================================================
-- 2. TRIGGER: Actualizar updated_at automáticamente
-- =====================================================
CREATE TRIGGER update_daily_summaries_updated_at
  BEFORE UPDATE ON daily_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en daily_summaries
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Políticas para daily_summaries
CREATE POLICY "Users can view own summaries"
  ON daily_summaries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries"
  ON daily_summaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries"
  ON daily_summaries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own summaries"
  ON daily_summaries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. FUNCIÓN: Actualizar daily_summary cuando cambian trades
-- Este trigger se activará en Fase 3 cuando se creen trades
-- Por ahora, la función está lista pero no se usa
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
    COUNT(*) FILTER (WHERE net_pnl > 0)::INTEGER,
    COUNT(*) FILTER (WHERE net_pnl < 0)::INTEGER,
    COALESCE(SUM(gross_pnl), 0),
    COALESCE(SUM(net_pnl), 0),
    COALESCE(SUM(commission), 0)
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

-- Nota: El trigger se creará en Fase 3 cuando exista la tabla trades
-- CREATE TRIGGER trigger_update_daily_summary
-- AFTER INSERT OR UPDATE OR DELETE ON trades
-- FOR EACH ROW
-- EXECUTE FUNCTION update_daily_summary();

-- =====================================================
-- FIN DE MIGRATION
-- =====================================================
