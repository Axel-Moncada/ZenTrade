"use client";

import { useTr } from "@/lib/i18n/use-tr";

/** Texto bilingüe para Server Components: <T es="Hola" en="Hello" /> */
export function T({ es, en }: { es: string; en: string }) {
  const { tr } = useTr();
  return <>{tr(es, en)}</>;
}
