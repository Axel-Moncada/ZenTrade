export interface DashboardStats {
  // KPIs principales
  totalPnl: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averagePerTrade: number;
  profitFactor: number;
  
  // Ganancias y pérdidas
  totalGrossWins: number;
  totalGrossLosses: number;
  maxGain: number;
  maxLoss: number;
  
  // Mejor día (para regla del 30%)
  bestDay: {
    date: string;
    pnl: number;
    percentOfTotal: number; // % que representa del profit acumulado
  } | null;
  
  // Peor día
  worstDay: {
    date: string;
    pnl: number;
  } | null;
  
  // Rachas
  currentStreak: {
    type: 'winning' | 'losing' | 'none';
    count: number;
  };
  
  // Plan adherence
  tradesFollowingPlan: number;
  planAdherenceRate: number;
  
  // Datos para gráficos
  equityCurve: EquityCurvePoint[];
  winsLossesByDay: WinsLossesPoint[];
  emotionsDistribution: EmotionDistribution[];
  exitReasonsDistribution: ExitReasonDistribution[];
  instrumentStats: InstrumentStats[];
}

export interface EquityCurvePoint {
  date: string;
  cumulativePnl: number;
  dailyPnl: number;
}

export interface WinsLossesPoint {
  date: string;
  wins: number;
  losses: number;
  totalTrades: number;
}

export interface EmotionDistribution {
  emotion: string;
  count: number;
  percentage: number;
}

export interface ExitReasonDistribution {
  reason: string;
  count: number;
  percentage: number;
}

export interface InstrumentStats {
  symbol: string;
  name: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  averagePnl: number;
}

export interface DateRange {
  startDate: string; // ISO format YYYY-MM-DD
  endDate: string;   // ISO format YYYY-MM-DD
  label: string;
}

export type DateRangePreset = '7d' | '30d' | '90d' | 'thisMonth' | 'custom';
