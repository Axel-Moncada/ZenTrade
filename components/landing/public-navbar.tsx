"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import logoMenu from "@/data/assets/Logo hori-white.png";
import { LandingControls } from "@/components/landing/landing-controls";
import { useI18n } from "@/lib/i18n/context";

interface PublicNavbarProps {
  isAuthenticated?: boolean;
}

export default function PublicNavbar({ isAuthenticated = false }: PublicNavbarProps) {
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t.landing.features, href: "/#features" },
    { label: t.landing.pricing, href: "/#pricing" },
    { label: t.landing.faq, href: "/#faq" },
    { label: "Blog", href: "/blog" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`landing-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "landing-nav-scrolled backdrop-blur-md border-b"
            : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Image src={logoMenu} alt="Zentrade Logo" className="h-12 w-auto" />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-zen-text-muted hover:text-zen-caribbean-green transition-colors rounded-lg hover:bg-zen-caribbean-green/10"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-3">
              <LandingControls />
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="zenGreen" className="group">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t.landing.goToDashboard}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-zen-text-muted hover:text-zen-caribbean-green hover:bg-zen-caribbean-green/10 transition-all"
                    >
                      {t.landing.signIn}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="zenGreen" className="group">
                      {t.landing.tryFree}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-zen-caribbean-green/10 text-zen-anti-flash transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="landing-mobile-menu fixed top-20 left-0 right-0 backdrop-blur-md border-b md:hidden z-40">
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
            {/* Mobile Nav Links */}
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="block px-4 py-3 text-sm font-medium text-zen-text-muted hover:text-zen-caribbean-green hover:bg-zen-caribbean-green/10 transition-colors rounded-lg"
              >
                {link.label}
              </a>
            ))}

            {/* Mobile Controls */}
            <div className="flex items-center gap-3 px-4 pt-2">
              <LandingControls />
            </div>

            {/* Mobile CTA Buttons */}
            <div className="space-y-2 pt-4 border-t border-zen-border-soft">
              {isAuthenticated ? (
                <Link href="/dashboard" onClick={handleNavClick}>
                  <Button variant="zenGreen" className="w-full group">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t.landing.goToDashboard}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={handleNavClick}>
                    <Button
                      variant="outline"
                      className="w-full border-zen-border-soft text-zen-text-muted hover:text-zen-caribbean-green hover:border-zen-caribbean-green"
                    >
                      {t.landing.signIn}
                    </Button>
                  </Link>
                  <Link href="/login" onClick={handleNavClick}>
                    <Button variant="zenGreen" className="w-full group">
                      {t.landing.tryFree}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
