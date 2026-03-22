"use client";

import { useState } from "react";
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
  UserCircle,
  CreditCard,
  Users,
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
  const { t } = useI18n();

  const displayName = userName || userEmail;
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

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
          <div
            className={`flex items-center gap-3 mb-2 ${isCollapsed ? "justify-center" : ""}`}
          >
            {!isCollapsed && (
              <div>
                <Image
                  src={LogoWhite}
                  alt="Zentrade Logo"
                  width={160}
                  height={96}
                  className="h-24 w-auto"
                  priority
                />
              </div>
            )}

            {isCollapsed && (
              <div>
                <Image
                  src={IsoWhite}
                  alt="Zentrade Logo"
                  width={144}
                  height={64}
                  className="h-auto w-36"
                  priority
                />
              </div>
            )}
          </div>

          {/* Theme + Language toggles below logo */}
          {!isCollapsed && (
            <div className="flex justify-center mt-10">
              <LandingControls />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className={`w-full text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors group my-1 ${
                isCollapsed ? "justify-center px-0" : "justify-start"
              }`}
            >
              <div className="p-1.5 bg-zen-caribbean-green/20 group-hover:bg-zen-caribbean-green/30 rounded-lg transition-colors">
                <LayoutDashboard className="h-4 w-4 text-zen-caribbean-green" />
              </div>
              {!isCollapsed && (
                <span className="font-medium text-lg ml-3">{t.nav.dashboard}</span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/accounts">
            <Button
              variant="ghost"
              className={`w-full text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors group my-1 ${
                isCollapsed ? "justify-center px-0" : "justify-start"
              }`}
            >
              <div className="p-1.5 bg-zen-caribbean-green/20 group-hover:bg-zen-caribbean-green/30 rounded-lg transition-colors">
                <Wallet className="h-4 w-4 text-zen-caribbean-green" />
              </div>
              {!isCollapsed && (
                <span className="font-medium text-lg ml-3">{t.nav.accounts}</span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/withdrawals">
            <Button
              variant="ghost"
              className={`w-full text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors group my-1 ${
                isCollapsed ? "justify-center px-0" : "justify-start"
              }`}
            >
              <div className="p-1.5 bg-zen-caribbean-green/20 group-hover:bg-zen-caribbean-green/30 rounded-lg transition-colors">
                <ArrowDownToLine className="h-4 w-4 text-zen-caribbean-green" />
              </div>
              {!isCollapsed && (
                <span className="font-medium text-lg ml-3">{t.nav.withdrawals}</span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/calendar">
            <Button
              variant="ghost"
              className={`w-full text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors group my-1 ${
                isCollapsed ? "justify-center px-0" : "justify-start"
              }`}
            >
              <div className="p-1.5 bg-zen-caribbean-green/20 group-hover:bg-zen-caribbean-green/30 rounded-lg transition-colors">
                <Calendar className="h-4 w-4 text-zen-caribbean-green" />
              </div>
              {!isCollapsed && (
                <span className="font-medium text-lg ml-3">{t.nav.calendar}</span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/trades">
            <Button
              variant="ghost"
              className={`w-full text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors group my-1 ${
                isCollapsed ? "justify-center px-0" : "justify-start"
              }`}
            >
              <div className="p-1.5 bg-zen-caribbean-green/20 group-hover:bg-zen-caribbean-green/30 rounded-lg transition-colors">
                <ListOrdered className="h-4 w-4 text-zen-caribbean-green" />
              </div>
              {!isCollapsed && (
                <span className="font-medium text-lg ml-3">{t.nav.trades}</span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/trading-plan">
            <Button
              variant="ghost"
              className={`w-full text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors group my-1 ${
                isCollapsed ? "justify-center px-0" : "justify-start"
              }`}
            >
              <div className="p-1.5 bg-zen-caribbean-green/20 group-hover:bg-zen-caribbean-green/30 rounded-lg transition-colors">
                <Target className="h-4 w-4 text-zen-caribbean-green" />
              </div>
              {!isCollapsed && (
                <span className="font-medium text-lg ml-3">{t.nav.tradingPlan}</span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard/billing">
            <Button
              variant="ghost"
              className={`w-full text-zen-anti-flash/70 hover:text-zen-anti-flash hover:bg-zen-caribbean-green/10 transition-colors group my-1 ${
                isCollapsed ? "justify-center px-0" : "justify-start"
              }`}
            >
              <div className="p-1.5 bg-zen-caribbean-green/20 group-hover:bg-zen-caribbean-green/30 rounded-lg transition-colors">
                <CreditCard className="h-4 w-4 text-zen-caribbean-green" />
              </div>
              {!isCollapsed && (
                <span className="font-medium text-lg ml-3">
                  Facturación
                </span>
              )}
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/dashboard/admin/affiliates">
              <Button
                variant="ghost"
                className={`w-full text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/10 transition-colors group my-1 ${
                  isCollapsed ? "justify-center px-0" : "justify-start"
                }`}
              >
                <div className="p-1.5 bg-amber-400/20 group-hover:bg-amber-400/30 rounded-lg transition-colors">
                  <Users className="h-4 w-4 text-amber-400" />
                </div>
                {!isCollapsed && (
                  <span className="font-medium text-lg ml-3">Afiliados</span>
                )}
              </Button>
            </Link>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto pt-6 border-t border-zen-forest/30">
          <Link href="/dashboard/profile">
            {isCollapsed ? (
              <div className="w-9 h-9 rounded-full bg-zen-caribbean-green flex items-center justify-center text-zen-rich-black font-bold text-sm mx-auto mb-3 hover:bg-zen-mountain-meadow transition-colors cursor-pointer select-none">
                {initials}
              </div>
            ) : (
              <div className="mb-4 p-3 rounded-lg bg-zen-bangladesh-green/40 hover:bg-zen-caribbean-green/10 transition-colors cursor-pointer flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zen-caribbean-green flex items-center justify-center text-zen-rich-black font-bold text-sm flex-shrink-0 select-none">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zen-anti-flash truncate">
                    {displayName}
                  </p>
                  {userName && (
                    <p className="text-xs text-zen-anti-flash/50 truncate">{userEmail}</p>
                  )}
                </div>
              </div>
            )}
          </Link>
          <LogoutButton collapsed={isCollapsed} />
        </div>

        {/* Toggle Button */}
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
