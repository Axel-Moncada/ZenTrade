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
  ChevronUp,
  FlipHorizontal2,
  BarChart2,
  Link2,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { LandingControls } from "@/components/landing/landing-controls";
import { useI18n } from "@/lib/i18n/context";
import LogoWhite from "@/data/assets/Logo-white.png";
import IsoWhite from "@/data/assets/Iso-white.png";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { ZenCoachWidget } from "@/components/zencoach/zencoach-widget";

interface SidebarLayoutProps {
  userEmail: string;
  userName?: string;
  isAdmin?: boolean;
  hasCompletedTour?: boolean;
  children: React.ReactNode;
}

export function SidebarLayout({
  userEmail,
  userName,
  isAdmin,
  hasCompletedTour = true,
  children,
}: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const pathname = usePathname();

  const displayName = userName || userEmail;
  const initials =
    displayName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  // Cerrar drawer mobile al navegar
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Bloquear scroll del body cuando drawer mobile está abierto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Cerrar user menu al hacer click fuera
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
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, tourId: "nav-dashboard" },
    { href: "/dashboard/accounts", label: t.nav.accounts, icon: Wallet, tourId: "nav-accounts" },
    { href: "/dashboard/withdrawals", label: t.nav.withdrawals, icon: ArrowDownToLine, tourId: undefined },
    { href: "/dashboard/calendar", label: t.nav.calendar, icon: Calendar, tourId: "nav-calendar" },
    { href: "/dashboard/trades", label: t.nav.trades, icon: ListOrdered, tourId: "nav-trades" },
    { href: "/dashboard/trading-plan", label: t.nav.tradingPlan, icon: Target, tourId: "nav-trading-plan" },
    { href: "/dashboard/backtesting", label: t.nav.backtesting, icon: FlipHorizontal2, tourId: undefined },
  ];

  // ── Shared nav content (usado en sidebar desktop y drawer mobile) ─────────
  function NavContent({ onNav }: { onNav?: () => void }) {
    return (
      <nav className="space-y-1 flex-1">
        {navItems.map(({ href, label, icon: Icon, tourId }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="block"
              onClick={onNav}
              {...(tourId ? { "data-tour": tourId } : {})}
            >
              <Button
                variant="ghost"
                className={`w-full text-zen-anti-flash/70 hover:text-zen-anti-flash transition-colors group my-0.5 justify-start ${
                  isActive
                    ? "bg-zen-caribbean-green/15 text-zen-anti-flash"
                    : "hover:bg-zen-caribbean-green/10"
                } ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-zen-caribbean-green/30"
                      : "bg-zen-caribbean-green/20 group-hover:bg-zen-caribbean-green/30"
                  }`}
                >
                  <Icon className="h-4 w-4 text-zen-caribbean-green" />
                </div>
                {!isCollapsed && (
                  <span className="font-medium text-base ml-3">{label}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>
    );
  }

  // ── User dropdown content ─────────────────────────────────────────────────
  function UserDropdown({ onNav }: { onNav?: () => void }) {
    return (
      <div className="bg-zen-dark-green border border-zen-forest/40 rounded-xl shadow-xl overflow-hidden">
        <Link
          href="/dashboard/profile"
          onClick={onNav}
          className="flex items-center gap-3 px-4 py-3 text-sm text-zen-anti-flash/80 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors"
        >
          <UserCircle className="h-4 w-4 text-zen-caribbean-green shrink-0" />
          <span>{t.nav.profile}</span>
        </Link>

        <Link
          href="/dashboard/billing"
          onClick={onNav}
          className="flex items-center gap-3 px-4 py-3 text-sm text-zen-anti-flash/80 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors border-t border-zen-forest/20"
        >
          <CreditCard className="h-4 w-4 text-zen-caribbean-green shrink-0" />
          <span>{t.nav.billing}</span>
        </Link>

        {isAdmin && (
          <>
            <div className="px-4 pt-3 pb-1 border-t border-zen-forest/20">
              <p className="text-xs font-semibold text-amber-400/60 uppercase tracking-wider">Admin</p>
            </div>
            <Link
              href="/dashboard/admin/users"
              onClick={onNav}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>Usuarios</span>
            </Link>
            <Link
              href="/dashboard/admin/affiliates"
              onClick={onNav}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
            >
              <Link2 className="h-4 w-4 shrink-0" />
              <span>Afiliados</span>
            </Link>
            <Link
              href="/dashboard/admin/metrics"
              onClick={onNav}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
            >
              <BarChart2 className="h-4 w-4 shrink-0" />
              <span>Métricas</span>
            </Link>
          </>
        )}

        <div className="px-3 py-2 border-t border-zen-forest/20">
          <LogoutButton collapsed={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zen-rich-black">

      {/* ── MOBILE TOP BAR ─────────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-zen-dark-green border-b border-zen-forest/30 flex items-center justify-between px-4">
        <Image
          src={LogoWhite}
          alt="Zentrade"
          width={120}
          height={36}
          className="h-7 w-auto"
          priority
        />
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* ── MOBILE OVERLAY ─────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER ──────────────────────────────────────────────────── */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-72 z-50 bg-zen-dark-green border-r border-zen-forest/30 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zen-forest/30">
          <Image
            src={LogoWhite}
            alt="Zentrade"
            width={130}
            height={40}
            className="h-8 w-auto"
          />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-zen-anti-flash/60 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controles de idioma/tema */}
        <div className="px-5 py-3 border-b border-zen-forest/20">
          <LandingControls />
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <nav className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon, tourId }) => {
              const isActive =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
                  style={
                    isActive
                      ? { background: "rgba(0,193,124,0.12)", color: "#F2F3F4" }
                      : { color: "rgba(242,243,244,0.65)" }
                  }
                  {...(tourId ? { "data-tour": tourId } : {})}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isActive
                        ? "rgba(0,193,124,0.25)"
                        : "rgba(0,193,124,0.15)",
                    }}
                  >
                    <Icon className="h-4 w-4 text-zen-caribbean-green" />
                  </div>
                  <span className="font-medium text-sm">{label}</span>
                  {isActive && (
                    <div
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: "#00C17C" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User section en el drawer */}
        <div className="border-t border-zen-forest/30 p-4 space-y-2">
          <Link
            href="/dashboard/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors"
          >
            <UserCircle className="h-4 w-4 text-zen-caribbean-green shrink-0" />
            <span className="text-sm font-medium">{t.nav.profile}</span>
          </Link>
          <Link
            href="/dashboard/billing"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors"
          >
            <CreditCard className="h-4 w-4 text-zen-caribbean-green shrink-0" />
            <span className="text-sm font-medium">{t.nav.billing}</span>
          </Link>

          {isAdmin && (
            <>
              <div className="px-3 pt-1">
                <p className="text-xs font-semibold text-amber-400/50 uppercase tracking-wider">Admin</p>
              </div>
              {[
                { href: "/dashboard/admin/users", label: "Usuarios", icon: Users },
                { href: "/dashboard/admin/affiliates", label: "Afiliados", icon: Link2 },
                { href: "/dashboard/admin/metrics", label: "Métricas", icon: BarChart2 },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </>
          )}

          <div className="pt-1">
            <LogoutButton collapsed={false} />
          </div>

          {/* User info chip */}
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl bg-zen-bangladesh-green/30">
            <div className="w-8 h-8 rounded-full bg-zen-caribbean-green flex items-center justify-center text-zen-rich-black font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zen-anti-flash truncate">{displayName}</p>
              {userName && (
                <p className="text-xs text-zen-anti-flash/40 truncate">{userEmail}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 bg-zen-dark-green border-r border-zen-forest/30 backdrop-blur-sm p-6 flex-col h-screen transition-all duration-300 z-40 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="mb-8 pb-6 border-b border-zen-forest/30">
          <div className={`flex items-center gap-3 mb-2 ${isCollapsed ? "justify-center" : ""}`}>
            {!isCollapsed ? (
              <Image
                src={LogoWhite}
                alt="Zentrade Logo"
                width={160}
                height={96}
                className="h-24 w-auto"
                priority
              />
            ) : (
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

        {/* Nav */}
        <nav className="space-y-1 flex-1">
          {navItems.map(({ href, label, icon: Icon, tourId }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="block"
                {...(tourId ? { "data-tour": tourId } : {})}
              >
                <Button
                  variant="ghost"
                  className={`w-full text-zen-anti-flash/70 hover:text-zen-anti-flash transition-colors group my-1 ${
                    isActive
                      ? "bg-zen-caribbean-green/15 text-zen-anti-flash"
                      : "hover:bg-zen-caribbean-green/10"
                  } ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-zen-caribbean-green/30"
                        : "bg-zen-caribbean-green/20 group-hover:bg-zen-caribbean-green/30"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-zen-caribbean-green" />
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-lg ml-3">{label}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User area con dropdown */}
        <div className="mt-auto pt-6 border-t border-zen-forest/30" ref={menuRef}>
          {userMenuOpen && (
            <div
              className={`absolute bg-zen-dark-green border border-zen-forest/40 rounded-xl shadow-xl overflow-hidden z-50 ${
                isCollapsed ? "left-full ml-2 w-52" : "left-0 right-0 mx-6"
              }`}
              style={{ bottom: "7rem" }}
            >
              <Link
                href="/dashboard/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-zen-anti-flash/80 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors"
              >
                <UserCircle className="h-4 w-4 text-zen-caribbean-green shrink-0" />
                <span>{t.nav.profile}</span>
              </Link>
              <Link
                href="/dashboard/billing"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-zen-anti-flash/80 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors border-t border-zen-forest/20"
              >
                <CreditCard className="h-4 w-4 text-zen-caribbean-green shrink-0" />
                <span>{t.nav.billing}</span>
              </Link>

              {isAdmin && (
                <>
                  <div className="px-4 pt-3 pb-1 border-t border-zen-forest/20">
                    <p className="text-xs font-semibold text-amber-400/60 uppercase tracking-wider">Admin</p>
                  </div>
                  {[
                    { href: "/dashboard/admin/users", label: "Usuarios", icon: Users },
                    { href: "/dashboard/admin/affiliates", label: "Afiliados", icon: Link2 },
                    { href: "/dashboard/admin/metrics", label: "Métricas", icon: BarChart2 },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400/80 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </>
              )}

              <div className="px-3 py-2 border-t border-zen-forest/20">
                <LogoutButton collapsed={false} />
              </div>
            </div>
          )}

          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="w-full text-left"
          >
            {isCollapsed ? (
              <div className="relative w-9 h-9 rounded-full bg-zen-caribbean-green flex items-center justify-center text-zen-rich-black font-bold text-sm mx-auto mb-3 hover:bg-zen-mountain-meadow transition-colors cursor-pointer select-none">
                {initials}
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-zen-dark-green border border-zen-forest/40 rounded-full flex items-center justify-center">
                  <ChevronUp
                    className={`h-2.5 w-2.5 text-zen-anti-flash/60 transition-transform duration-200 ${
                      userMenuOpen ? "" : "rotate-180"
                    }`}
                  />
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
                <ChevronUp
                  className={`h-4 w-4 text-zen-anti-flash/40 transition-transform duration-200 shrink-0 ${
                    userMenuOpen ? "" : "rotate-180"
                  }`}
                />
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

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main
        className={`flex-1 overflow-auto transition-all duration-300
          pt-14 px-4 pb-28
          md:pt-20 md:pb-0
          ${isCollapsed ? "md:ml-20 md:px-12" : "md:ml-64 md:px-28"}
        `}
      >
        {children}
      </main>

      <OnboardingTour hasCompletedTour={hasCompletedTour} />
      <ZenCoachWidget />
    </div>
  );
}
