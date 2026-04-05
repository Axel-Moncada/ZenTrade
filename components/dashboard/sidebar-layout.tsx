"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  ListOrdered,
  Target,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Users,
  UserCircle,
  LogOut,
  ChevronUp,
  FlipHorizontal2,
  ShieldCheck,
  BarChart2,
  Link2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";
import { LandingControls } from "@/components/landing/landing-controls";
import { useI18n } from "@/lib/i18n/context";
import LogoWhite from "@/data/assets/Logo-white.png";
import IsoWhite from "@/data/assets/Iso-white.png";

interface SidebarLayoutProps {
  userEmail: string;
  userName?: string;
  isAdmin?: boolean;
  children: React.ReactNode;
}

export function SidebarLayout({ userEmail, userName, isAdmin, children }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const displayName = userName || userEmail;
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/dashboard/accounts", label: t.nav.accounts, icon: Wallet },
    { href: "/dashboard/withdrawals", label: t.nav.withdrawals, icon: ArrowDownToLine },
    { href: "/dashboard/calendar", label: t.nav.calendar, icon: Calendar },
    { href: "/dashboard/trades", label: t.nav.trades, icon: ListOrdered },
    { href: "/dashboard/trading-plan", label: t.nav.tradingPlan, icon: Target },
    { href: "/dashboard/backtesting", label: t.nav.backtesting, icon: FlipHorizontal2 },
  ];

  return (
    <div className="min-h-screen flex bg-zen-rich-black">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bg-zen-dark-green border-r border-zen-forest/30 backdrop-blur-sm p-6 flex flex-col h-screen transition-all duration-300 z-50 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo/Header */}
        <div className="mb-8 pb-6 border-b border-zen-forest/30">
          <div className={`flex items-center gap-3 mb-2 ${isCollapsed ? "justify-center" : ""}`}>
            {!isCollapsed && (
              <Image
                src={LogoWhite}
                alt="Zentrade Logo"
                width={160}
                height={96}
                className="h-24 w-auto"
                priority
              />
            )}
            {isCollapsed && (
              <Image
                src={IsoWhite}
                alt="Zentrade Logo"
                width={144}
                height={64}
                className="h-auto w-36"
                priority
              />
            )}
          </div>

          {!isCollapsed && (
            <div className="flex justify-center mt-10">
              <LandingControls />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant="ghost"
                className={`w-full text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors group my-1 ${
                  isCollapsed ? "justify-center px-0" : "justify-start"
                }`}
              >
                <div className="p-1.5 bg-zen-caribbean-green/20 group-hover:bg-zen-caribbean-green/30 rounded-lg transition-colors">
                  <Icon className="h-4 w-4 text-zen-caribbean-green" />
                </div>
                {!isCollapsed && (
                  <span className="font-medium text-lg ml-3">{label}</span>
                )}
              </Button>
            </Link>
          ))}
        </nav>

        {/* User area con dropdown */}
        <div className="mt-auto pt-6 border-t border-zen-forest/30" ref={menuRef}>
          {/* Dropdown menu (aparece arriba) */}
          {userMenuOpen && (
            <div
              className={`absolute bottom-[calc(100%-2rem)] mb-2 bg-zen-dark-green border border-zen-forest/40 rounded-xl shadow-xl overflow-hidden z-50 ${
                isCollapsed ? "left-full ml-2 w-52" : "left-0 right-0 mx-6"
              }`}
              style={{ bottom: "7rem" }}
            >
              {/* Perfil */}
              <Link
                href="/dashboard/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-zen-anti-flash/80 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors"
              >
                <UserCircle className="h-4 w-4 text-zen-caribbean-green shrink-0" />
                <span>{t.nav.profile}</span>
              </Link>

              {/* Facturación */}
              <Link
                href="/dashboard/billing"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-zen-anti-flash/80 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors border-t border-zen-forest/20"
              >
                <CreditCard className="h-4 w-4 text-zen-caribbean-green shrink-0" />
                <span>{t.nav.billing}</span>
              </Link>

              {/* Admin (solo si es admin) */}
              {isAdmin && (
                <>
                  <div className="px-4 pt-3 pb-1 border-t border-zen-forest/20">
                    <p className="text-xs font-semibold text-amber-400/60 uppercase tracking-wider">Admin</p>
                  </div>
                  <Link
                    href="/dashboard/admin/users"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                  >
                    <Users className="h-4 w-4 shrink-0" />
                    <span>Usuarios</span>
                  </Link>
                  <Link
                    href="/dashboard/admin/affiliates"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                  >
                    <Link2 className="h-4 w-4 shrink-0" />
                    <span>Afiliados</span>
                  </Link>
                  <Link
                    href="/dashboard/admin/metrics"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                  >
                    <BarChart2 className="h-4 w-4 shrink-0" />
                    <span>Métricas</span>
                  </Link>
                </>
              )}

              {/* Logout */}
              <div className="px-3 py-2 border-t border-zen-forest/20">
                <LogoutButton collapsed={false} />
              </div>
            </div>
          )}

          {/* Trigger: avatar/card del usuario */}
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="w-full text-left"
          >
            {isCollapsed ? (
              <div className="relative w-9 h-9 rounded-full bg-zen-caribbean-green flex items-center justify-center text-zen-rich-black font-bold text-sm mx-auto mb-3 hover:bg-zen-mountain-meadow transition-colors cursor-pointer select-none">
                {initials}
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-zen-dark-green border border-zen-forest/40 rounded-full flex items-center justify-center">
                  <ChevronUp className={`h-2.5 w-2.5 text-zen-anti-flash/60 transition-transform duration-200 ${userMenuOpen ? "" : "rotate-180"}`} />
                </span>
              </div>
            ) : (
              <div className="mb-1 p-3 rounded-lg bg-zen-bangladesh-green/40 hover:bg-zen-caribbean-green/10 transition-colors cursor-pointer flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zen-caribbean-green flex items-center justify-center text-zen-rich-black font-bold text-sm flex-shrink-0 select-none">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zen-anti-flash truncate">{displayName}</p>
                  {userName && (
                    <p className="text-xs text-zen-anti-flash/50 truncate">{userEmail}</p>
                  )}
                </div>
                <ChevronUp className={`h-4 w-4 text-zen-anti-flash/40 transition-transform duration-200 shrink-0 ${userMenuOpen ? "" : "rotate-180"}`} />
              </div>
            )}
          </button>
        </div>

        {/* Toggle collapse */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-6 -right-3 bg-zen-caribbean-green/20 hover:bg-zen-caribbean-green/30 p-1.5 rounded-full border-2 border-zen-dark-green transition-all duration-200 z-10 shadow-lg"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-zen-caribbean-green" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-zen-caribbean-green" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-auto py-20 transition-all duration-300 ${isCollapsed ? "ml-20 px-12" : "ml-64 px-28"}`}
      >
        {children}
      </main>
    </div>
  );
}
