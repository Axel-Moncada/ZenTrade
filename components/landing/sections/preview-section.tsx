"use client";

import { Play, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function PreviewSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-transparent via-zen-dark-green/25 to-transparent">
      {/* Radial ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zen-caribbean-green/10 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-zen-anti-flash mb-6">
            Ve ZenTrade en Acción
          </h2>
          <p className="text-lg text-zen-text-muted">
            Un vistazo rápido a cómo ZenTrade transforma tu proceso de análisis
            y te acerca a tu funded account.
          </p>
        </div>

        {/* Preview Container */}
        <div className="relative">
          {/* Main Preview Card */}
          <div className="relative bg-zen-surface-elevated rounded-3xl border border-zen-caribbean-green/30 overflow-hidden shadow-2xl shadow-zen-caribbean-green/20">
            {/* Browser Chrome */}
            <div className="bg-zen-surface border-b border-zen-border-soft px-6 py-4 flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-zen-danger/50" />
                <div className="w-3 h-3 rounded-full bg-zen-caribbean-green/50" />
                <div className="w-3 h-3 rounded-full bg-zen-mountain-meadow/50" />
              </div>
              <div className="flex-1 bg-zen-rich-black rounded px-4 py-1.5 text-sm text-zen-text-muted flex items-center">
                <ExternalLink className="h-3 w-3 mr-2" />
                zentrade.app/dashboard
              </div>
            </div>

            {/* Screenshot Placeholder */}
            <div className="relative aspect-video bg-gradient-to-br from-zen-dark-green/20 to-zen-rich-black p-8">
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Mock stat cards */}
                <div className="bg-zen-surface rounded-xl p-4 border border-zen-border-soft">
                  <p className="text-xs text-zen-text-muted mb-1">Total Trades</p>
                  <p className="text-2xl font-bold text-zen-anti-flash">247</p>
                </div>
                <div className="bg-zen-surface rounded-xl p-4 border border-zen-border-soft">
                  <p className="text-xs text-zen-text-muted mb-1">Win Rate</p>
                  <p className="text-2xl font-bold text-zen-caribbean-green">71.2%</p>
                </div>
                <div className="bg-zen-surface rounded-xl p-4 border border-zen-border-soft">
                  <p className="text-xs text-zen-text-muted mb-1">Net Profit</p>
                  <p className="text-2xl font-bold text-zen-caribbean-green">$12,450</p>
                </div>
              </div>

              {/* Mock chart */}
              <div className="bg-zen-surface rounded-xl p-6 border border-zen-border-soft h-48 relative overflow-hidden">
                <p className="text-sm font-semibold text-zen-anti-flash mb-4">
                  Equity Curve
                </p>
                <svg className="w-full h-full absolute bottom-0 left-0" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <polyline
                    points="0,100 50,95 100,85 150,80 200,70 250,60 300,50 350,45 400,40"
                    fill="none"
                    stroke="rgb(0, 193, 124)"
                    strokeWidth="3"
                  />
                  <polyline
                    points="0,100 50,95 100,85 150,80 200,70 250,60 300,50 350,45 400,40 400,120 0,120"
                    fill="url(#previewGradient)"
                    opacity="0.3"
                  />
                  <defs>
                    <linearGradient id="previewGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(0, 193, 124)" />
                      <stop offset="100%" stopColor="rgb(0, 193, 124)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-zen-rich-black/60 backdrop-blur-sm cursor-pointer group hover:bg-zen-rich-black/40 transition-all">
                <div className="w-20 h-20 bg-zen-caribbean-green rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl shadow-zen-caribbean-green/50">
                  <Play className="h-10 w-10 text-zen-rich-black ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Feature Cards */}
          <div className="absolute -left-4 top-1/4 bg-zen-surface rounded-xl p-4 border border-zen-caribbean-green/30 shadow-xl hidden lg:block">
            <p className="text-xs text-zen-text-muted mb-1">Multi-Account</p>
            <p className="text-lg font-bold text-zen-caribbean-green">3 Active</p>
          </div>
          <div className="absolute -right-4 bottom-1/4 bg-zen-surface rounded-xl p-4 border border-zen-caribbean-green/30 shadow-xl hidden lg:block">
            <p className="text-xs text-zen-text-muted mb-1">Export Ready</p>
            <p className="text-lg font-bold text-zen-caribbean-green">PDF ✓</p>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-12 text-center">
          <p className="text-zen-text-muted">
            <span className="text-zen-caribbean-green font-semibold">Demo interactivo disponible</span> — Prueba todas las funciones sin registrarte
          </p>
        </div>
      </div>
    </section>
  );
}
