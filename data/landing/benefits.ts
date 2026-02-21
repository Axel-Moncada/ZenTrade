import { Brain, TrendingUp, Zap, Award } from "lucide-react";

export interface Benefit {
  icon: typeof Brain;
  title: string;
  description: string;
}

export const benefits: Benefit[] = [
  {
    icon: Brain,
    title: "Control Emocional",
    description: "Decisiones basadas en datos objetivos, no en emociones del momento. Elimina el trading impulsivo.",
  },
  {
    icon: TrendingUp,
    title: "Métricas Reales",
    description: "Conoce tu edge real en el mercado. Identifica qué funciona y qué no en tu estrategia.",
  },
  {
    icon: Zap,
    title: "Escalabilidad",
    description: "Pasa de 5K a 200K con estructura profesional. Gestiona múltiples cuentas sin perder control.",
  },
  {
    icon: Award,
    title: "Profesionalización",
    description: "Documentación completa para prop firms. Reportes que demuestran tu consistencia y disciplina.",
  },
];
