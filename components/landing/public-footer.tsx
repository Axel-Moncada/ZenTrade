"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/context";
import Logo from "@/data/assets/Logo hori-white.png";

export default function PublicFooter() {
  const { t } = useI18n();
  const l = t.landing;
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: l.footerProduct,
      links: [
        { label: l.footerLinkFeatures, href: "/#features" },
        { label: l.footerLinkPricing, href: "/#pricing" },
        { label: l.footerLinkDashboard, href: "/dashboard" },
      ],
    },
    {
      title: l.footerLegal,
      links: [
        { label: l.footerLinkTerms, href: "/terms" },
        { label: l.footerLinkPrivacy, href: "/privacy" },
        { label: l.footerLinkRefunds, href: "/refunds" },
        { label: l.footerLinkCookies, href: "/cookies" },
        { label: l.footerLinkDisclaimer, href: "/disclaimer" },
      ],
    },
  ];

  return (
    <footer className="bg-zen-surface border-t border-zen-border-soft">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <div>
              <Image src={Logo} alt="ZenTrade Logo" className="h-8 w-auto" />
            </div>
            <p className="text-zen-text-muted text-sm leading-relaxed">{l.footerTagline}</p>
          </div>

          {footerLinks.map((column) => (
            <div key={column.title} className="space-y-4">
              <h4 className="font-semibold text-zen-anti-flash text-sm uppercase tracking-wide">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-zen-text-muted hover:text-zen-caribbean-green transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-zen-border-soft my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-zen-text-muted text-sm">
            &copy; {currentYear} ZenTrade. {l.footerCopyright}
          </p>
          <div className="flex items-center space-x-6">
            <Link href="/login" className="text-zen-text-muted hover:text-zen-caribbean-green transition-colors text-sm">
              {l.signIn}
            </Link>
            <div className="w-px h-4 bg-zen-border-soft" />
            <Link href="/register" className="text-zen-text-muted hover:text-zen-caribbean-green transition-colors text-sm">
              {l.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
