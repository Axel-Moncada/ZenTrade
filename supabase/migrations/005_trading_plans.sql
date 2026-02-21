-- Tabla para planes de trading
CREATE TABLE IF NOT EXISTS trading_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- Objetivos
  daily_profit_target DECIMAL(12, 2),
  daily_loss_limit DECIMAL(12, 2),
  weekly_profit_target DECIMAL(12, 2),
  weekly_loss_limit DECIMAL(12, 2),
  monthly_profit_target DECIMAL(12, 2),
  monthly_loss_limit DECIMAL(12, 2),
  
  -- Reglas de entrada/salida
  entry_rules TEXT,
  exit_rules TEXT,
  
  -- Gestión de riesgo
  max_risk_per_trade DECIMAL(5, 2), -- porcentaje
  max_daily_trades INTEGER,
  max_concurrent_positions INTEGER,
  min_risk_reward_ratio DECIMAL(5, 2),
  
  -- Instrumentos permitidos
  allowed_instruments TEXT[], -- array de instrumentos
  
  -- Horarios de trading
  trading_start_time TIME,
  trading_end_time TIME,
  trading_days INTEGER[], -- array de días [0=domingo, 6=sábado]
  
  -- Checklist pre-trade
  pre_trade_checklist TEXT[], -- array de items del checklist
  
  -- Notas y estrategia
  strategy_notes TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: solo un plan activo por cuenta
  CONSTRAINT unique_active_plan_per_account UNIQUE (account_id, is_active)
);

-- Índices
CREATE INDEX idx_trading_plans_user_id ON trading_plans(user_id);
CREATE INDEX idx_trading_plans_account_id ON trading_plans(account_id);
CREATE INDEX idx_trading_plans_active ON trading_plans(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE trading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trading plans"
  ON trading_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trading plans"
  ON trading_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading plans"
  ON trading_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trading plans"
  ON trading_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_trading_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER trigger_update_trading_plan_timestamp
BEFORE UPDATE ON trading_plans
FOR EACH ROW
EXECUTE FUNCTION update_trading_plan_timestamp();

-- Comentarios
COMMENT ON TABLE trading_plans IS 'Planes de trading personalizados por cuenta';
COMMENT ON COLUMN trading_plans.max_risk_per_trade IS 'Riesgo máximo por trade en porcentaje del balance';
COMMENT ON COLUMN trading_plans.trading_days IS 'Días permitidos: 0=Domingo, 1=Lunes, ..., 6=Sábado';
