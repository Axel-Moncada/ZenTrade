export interface TradingPlan {
  id: string
  user_id: string
  account_id: string
  
  // Objetivos
  daily_profit_target: number | null
  daily_loss_limit: number | null
  weekly_profit_target: number | null
  weekly_loss_limit: number | null
  monthly_profit_target: number | null
  monthly_loss_limit: number | null
  
  // Reglas de entrada/salida
  entry_rules: string | null
  exit_rules: string | null
  
  // Gestión de riesgo
  max_risk_per_trade: number | null // porcentaje
  max_daily_trades: number | null
  max_concurrent_positions: number | null
  min_risk_reward_ratio: number | null
  
  // Instrumentos permitidos
  allowed_instruments: string[] | null
  
  // Horarios de trading
  trading_start_time: string | null // formato HH:mm
  trading_end_time: string | null
  trading_days: number[] | null // 0=domingo, 6=sábado
  
  // Checklist pre-trade
  pre_trade_checklist: string[] | null
  
  // Notas y estrategia
  strategy_notes: string | null
  
  // Metadata
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TradingPlanFormData {
  account_id: string
  
  // Objetivos
  daily_profit_target?: number | null
  daily_loss_limit?: number | null
  weekly_profit_target?: number | null
  weekly_loss_limit?: number | null
  monthly_profit_target?: number | null
  monthly_loss_limit?: number | null
  
  // Reglas
  entry_rules?: string | null
  exit_rules?: string | null
  
  // Gestión de riesgo
  max_risk_per_trade?: number | null
  max_daily_trades?: number | null
  max_concurrent_positions?: number | null
  min_risk_reward_ratio?: number | null
  
  // Instrumentos
  allowed_instruments?: string[] | null
  
  // Horarios
  trading_start_time?: string | null
  trading_end_time?: string | null
  trading_days?: number[] | null
  
  // Checklist
  pre_trade_checklist?: string[] | null
  
  // Notas
  strategy_notes?: string | null
}

export const WEEK_DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]
