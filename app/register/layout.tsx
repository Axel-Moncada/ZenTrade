import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta Gratis",
  description:
    "Crea tu cuenta gratuita en Zentrade y empieza a llevar tu journal de trading hoy.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
