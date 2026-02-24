"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  TrendingUp,
  ListOrdered,
  Target,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import LogoWhite from "@/data/assets/Logo-green.png";
import IsoWhite from "@/data/assets/Iso-white.png";

interface SidebarLayoutProps {
  userEmail: string;
  children: React.ReactNode;
}

export function SidebarLayout({ userEmail, children }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
                <span className="font-medium text-lg ml-3">Dashboard</span>
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
                <span className="font-medium text-lg ml-3">Cuentas</span>
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
                <span className="font-medium text-lg ml-3">Retiros</span>
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
                <span className="font-medium text-lg ml-3">Calendario</span>
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
                <span className="font-medium text-lg ml-3">Trades</span>
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
                <span className="font-medium text-lg ml-3">
                  Plan de Trading
                </span>
              )}
            </Button>
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto pt-6 border-t border-zen-forest/30">
          {!isCollapsed && (
            <div className="mb-4 p-3 rounded-lg bg-zen-bangladesh-green/40">
              <p className="text-xs font-semibold text-zen-anti-flash/60 uppercase tracking-wider mb-1">
                Usuario
              </p>
              <p className="text-sm font-semibold text-zen-anti-flash truncate">
                {userEmail}
              </p>
            </div>
          )}
          
          <ThemeToggle collapsed={isCollapsed} />
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
