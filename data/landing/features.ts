import { Wallet, BarChart3, Upload, Target, FileDown } from "lucide-react";

export interface Feature {
  icon: typeof Wallet;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: Wallet,
    title: "Journal Multi-Cuenta",
    description: "Gestiona FTMO, prop firms y cuentas personales por separado. Mantén el tracking perfecto de cada evaluación.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analítico",
    description: "KPIs en tiempo real: win rate, profit factor, consistencia y drawdown. Datos que impulsan decisiones.",
  },
  {
    icon: Upload,
    title: "Import CSV Inteligente",
    description: "Carga trades desde NinjaTrader, MT5, TradingView y más. Sincronización automática de tus operaciones.",
  },
  {
    icon: Target,
    title: "Trading Plan Digital",
    description: "Define reglas, límites de riesgo y estrategias. Exporta tu plan en PDF profesional para prop firms.",
  },
  {
    icon: FileDown,
    title: "Reportes Exportables",
    description: "Genera reportes completos con métricas clave. Documentación lista para evaluaciones de prop firms.",
  },
];
