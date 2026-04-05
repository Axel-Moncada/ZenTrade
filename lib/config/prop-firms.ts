export interface PropFirmRule {
  id: string
  label: string
  description: string
  /** null = no aplica para esta firma */
  value: number | null
  /** unidad a mostrar */
  unit: '%' | 'días'
  /** si es un límite máximo (rojo = superado) o mínimo (rojo = no alcanzado) */
  type: 'max_limit' | 'min_target'
}

export interface PropFirm {
  id: string
  name: string
  phase: string
  logo: string           // emoji representativo
  color: string          // color acento de la firma
  rules: {
    profitTarget: number       // % sobre balance inicial
    maxDrawdown: number        // % máximo drawdown total
    maxDailyLoss: number | null // % máximo pérdida en un día (null = sin regla)
    minTradingDays: number | null // días mínimos operados (null = sin requisito)
    consistencyRule: boolean   // aplica regla de consistencia
    drawdownType: 'trailing' | 'static'
  }
}

export const PROP_FIRMS: PropFirm[] = [
  {
    id: 'ftmo_challenge',
    name: 'FTMO',
    phase: 'Challenge',
    logo: '🔵',
    color: '#1A73E8',
    rules: {
      profitTarget: 10,
      maxDrawdown: 10,
      maxDailyLoss: 5,
      minTradingDays: 10,
      consistencyRule: true,
      drawdownType: 'trailing',
    },
  },
  {
    id: 'ftmo_verification',
    name: 'FTMO',
    phase: 'Verificación',
    logo: '🔵',
    color: '#1A73E8',
    rules: {
      profitTarget: 5,
      maxDrawdown: 10,
      maxDailyLoss: 5,
      minTradingDays: 10,
      consistencyRule: true,
      drawdownType: 'trailing',
    },
  },
  {
    id: 'apex_100k',
    name: 'Apex Trader Funding',
    phase: '100K',
    logo: '🟠',
    color: '#F97316',
    rules: {
      profitTarget: 9,
      maxDrawdown: 6,
      maxDailyLoss: null,
      minTradingDays: null,
      consistencyRule: false,
      drawdownType: 'trailing',
    },
  },
  {
    id: 'topstep_100k',
    name: 'TopStep',
    phase: '100K',
    logo: '🟣',
    color: '#8B5CF6',
    rules: {
      profitTarget: 6,
      maxDrawdown: 6,
      maxDailyLoss: 3,
      minTradingDays: null,
      consistencyRule: false,
      drawdownType: 'trailing',
    },
  },
  {
    id: 'uprofit_100k',
    name: 'Uprofit',
    phase: '100K',
    logo: '🟡',
    color: '#EAB308',
    rules: {
      profitTarget: 8,
      maxDrawdown: 8,
      maxDailyLoss: null,
      minTradingDays: null,
      consistencyRule: false,
      drawdownType: 'trailing',
    },
  },
  {
    id: 'tradoverse_100k',
    name: 'Tradoverse',
    phase: '100K',
    logo: '🟢',
    color: '#10B981',
    rules: {
      profitTarget: 10,
      maxDrawdown: 10,
      maxDailyLoss: 5,
      minTradingDays: null,
      consistencyRule: false,
      drawdownType: 'trailing',
    },
  },
]
