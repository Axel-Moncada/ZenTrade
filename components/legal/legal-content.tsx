"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export type LegalPageKey = "terms" | "privacy" | "refunds" | "cookies" | "disclaimer";

interface Props {
  pageKey: LegalPageKey;
}

export default function LegalContent({ pageKey }: Props) {
  const { t } = useI18n();
  const legal = t.legal;
  const page = legal[pageKey];

  return (
    <main className="pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zen-text-muted hover:text-zen-caribbean-green transition-colors text-sm mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {legal.backHome}
        </Link>

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-zen-anti-flash mb-3">
            {page.title}
          </h1>
          <p className="text-sm text-zen-text-muted">
            {legal.lastUpdated}: {page.date}
          </p>
          <p className="mt-5 text-base text-zen-text-muted leading-relaxed border-l-2 border-zen-caribbean-green/40 pl-4">
            {page.subtitle}
          </p>
        </div>

        {/* Warning banner — only for disclaimer */}
        {pageKey === "disclaimer" && (
          <div className="mb-10 rounded-xl border border-red-500/40 bg-red-500/5 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-400 text-sm">
                  {t.legal.disclaimer.warning.title}
                </p>
                <p className="text-zen-anti-flash/80 mt-1 text-sm leading-relaxed">
                  {t.legal.disclaimer.warning.body}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-10 border-t border-zen-border-soft pt-10">
          {page.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-base font-semibold text-zen-anti-flash mb-3">
                {section.heading}
              </h2>
              <div className="space-y-3">
                {section.body.map((para, j) => (
                  <p key={j} className="text-zen-text-muted leading-relaxed text-sm">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom link */}
        <div className="mt-16 pt-8 border-t border-zen-border-soft text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zen-caribbean-green hover:underline text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {legal.backHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
