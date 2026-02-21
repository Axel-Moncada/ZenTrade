import { AlertTriangle, Shuffle, RotateCcw } from "lucide-react";

export interface PainPoint {
  icon: typeof AlertTriangle;
  title: string;
  description: string;
}

export const painPoints: PainPoint[] = [
  {
    icon: AlertTriangle,
    title: "Trading a Ciegas",
    description: "Sin métricas reales, cada trade es una apuesta. No sabes si tu estrategia funciona o estás teniendo suerte.",
  },
  {
    icon: Shuffle,
    title: "Desorganización Costosa",
    description: "Cuentas mezcladas, datos perdidos en hojas de cálculo. Oportunidades de mejora desperdiciadas por falta de orden.",
  },
  {
    icon: RotateCcw,
    title: "Sin Mejora Continua",
    description: "Repites los mismos errores sin aprender de tu historial. Tu curva de aprendizaje se estanca sin feedback estructurado.",
  },
];
