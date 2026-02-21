"use client";

import { CheckCircle2, BarChart3 } from "lucide-react";

export default function SolutionSection() {
  const solutions = [
    "Tracking automático de todas tus operaciones",
    "Dashboard analítico con KPIs profesionales",
    "Gestión multi-cuenta para prop firms",
    "Trading plan digital con export PDF",
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-transparent via-zen-dark-green/30 to-transparent">
      {/* Ambient light effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zen-caribbean-green/10 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Visual */}
          <div className="relative">
            <div className="bg-zen-surface-elevated rounded-3xl p-8 border border-zen-caribbean-green/30 shadow-2xl shadow-zen-caribbean-green/10">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="h-8 w-8 text-zen-caribbean-green" />
                <h3 className="text-2xl font-bold text-zen-anti-flash">
                  ZenTrade Dashboard
                </h3>
              </div>
              
              {/* Mock Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zen-rich-black rounded-xl p-4 border border-zen-border-soft">
                  <p className="text-zen-text-muted text-sm mb-1">Win Rate</p>
                  <p className="text-3xl font-bold text-zen-caribbean-green">68.5%</p>
                </div>
                <div className="bg-zen-rich-black rounded-xl p-4 border border-zen-border-soft">
                  <p className="text-zen-text-muted text-sm mb-1">Profit Factor</p>
                  <p className="text-3xl font-bold text-zen-caribbean-green">2.4</p>
                </div>
                <div className="bg-zen-rich-black rounded-xl p-4 border border-zen-border-soft">
                  <p className="text-zen-text-muted text-sm mb-1">Avg Win</p>
                  <p className="text-3xl font-bold text-zen-anti-flash">$280</p>
                </div>
                <div className="bg-zen-rich-black rounded-xl p-4 border border-zen-border-soft">
                  <p className="text-zen-text-muted text-sm mb-1">Max DD</p>
                  <p className="text-3xl font-bold text-zen-anti-flash">-3.2%</p>
                </div>
              </div>

              {/* Mock Chart Line */}
              <div className="mt-6 h-32 bg-zen-rich-black rounded-xl border border-zen-border-soft relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <polyline
                    points="0,80 50,70 100,50 150,45 200,30 250,25 300,20"
                    fill="none"
                    stroke="rgb(0, 193, 124)"
                    strokeWidth="2"
                  />
                  <polyline
                    points="0,80 50,70 100,50 150,45 200,30 250,25 300,20 300,100 0,100"
                    fill="url(#gradient)"
                    opacity="0.2"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(0, 193, 124)" />
                      <stop offset="100%" stopColor="rgb(0, 193, 124)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Right: Copy */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-zen-anti-flash mb-6">
                La Solución Profesional
                <br />
                <span className="text-zen-caribbean-green">Que Buscabas</span>
              </h2>
              <p className="text-xl text-zen-text-muted leading-relaxed">
                ZenTrade centraliza tu actividad de trading en un dashboard
                analítico que te muestra exactamente dónde estás ganando y dónde
                estás perdiendo dinero.
              </p>
            </div>

            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-zen-caribbean-green flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-zen-anti-flash">{solution}</p>
                </div>
              ))}
            </div>

            <div className="bg-zen-surface-elevated rounded-xl p-6 border border-zen-caribbean-green/30">
              <p className="text-zen-anti-flash font-semibold text-lg">
                💡 "Pasé de fallar FTMO 3 veces a obtener mi primera funded
                account en 6 semanas usando ZenTrade."
              </p>
              <p className="text-zen-text-muted mt-2">— Carlos M., Futures Trader</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
