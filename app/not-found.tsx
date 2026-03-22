"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CANDLESTICKS = [
  { h: 72, o: 58, c: 65, l: 50, bull: true },
  { h: 80, o: 65, c: 74, l: 60, bull: true },
  { h: 78, o: 74, c: 68, l: 62, bull: false },
  { h: 75, o: 68, c: 72, l: 64, bull: true },
  { h: 73, o: 72, c: 56, l: 48, bull: false },
  { h: 60, o: 56, c: 58, l: 44, bull: true },
  { h: 62, o: 58, c: 44, l: 36, bull: false },
  { h: 46, o: 44, c: 30, l: 22, bull: false },
  { h: 34, o: 30, c: 18, l: 10, bull: false },
  { h: 22, o: 18, c: 8,  l: 2,  bull: false },
];

const TICKER_ITEMS = [
  { sym: "ES",  chg: "-4.04%", col: "#E5484D" },
  { sym: "NQ",  chg: "-3.87%", col: "#E5484D" },
  { sym: "CL",  chg: "-1.22%", col: "#E5484D" },
  { sym: "GC",  chg: "+0.41%", col: "#00C17C" },
  { sym: "RTY", chg: "-5.13%", col: "#E5484D" },
  { sym: "ZB",  chg: "+0.88%", col: "#00C17C" },
];

export default function NotFound() {
  const [visible, setVisible] = useState(false);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    const i = setInterval(() => setTick((n) => n + 1), 800);
    return () => { clearTimeout(t); clearInterval(i); };
  }, []);

  return (
    <div
      className="not-found-root"
      style={{
        minHeight: "100dvh",
        background: "#001B1F",
        color: "#F2F3F4",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Grid background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,193,124,0.04) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,193,124,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* Radial glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,193,124,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Ticker bar */}
      <div
        style={{
          width: "100%",
          background: "#002E21",
          borderBottom: "1px solid rgba(0,193,124,0.15)",
          overflow: "hidden",
          height: 36,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 48,
            animation: "ticker-scroll 18s linear infinite",
            whiteSpace: "nowrap",
            paddingLeft: "100%",
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                fontWeight: 600,
                color: item.col,
                display: "inline-flex",
                gap: 6,
              }}
            >
              <span style={{ color: "rgba(242,243,244,0.55)" }}>{item.sym}</span>
              {item.chg}
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          position: "relative",
          zIndex: 1,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* Terminal card */}
        <div
          style={{
            width: "100%",
            maxWidth: 680,
            background: "#002E21",
            border: "1px solid rgba(0,193,124,0.18)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow:
              "0 0 0 1px rgba(0,193,124,0.05), 0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,193,124,0.04)",
          }}
        >
          {/* Terminal title bar */}
          <div
            style={{
              background: "#001B1F",
              borderBottom: "1px solid rgba(0,193,124,0.12)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#E5484D",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#F5A623",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#00C17C",
                display: "inline-block",
              }}
            />
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: "rgba(242,243,244,0.35)",
                letterSpacing: "0.1em",
              }}
            >
              ZENTRADE — ORDER MANAGER
            </span>
          </div>

          {/* Chart area */}
          <div
            style={{
              padding: "24px 24px 8px",
              background: "rgba(0,0,0,0.2)",
              borderBottom: "1px solid rgba(0,193,124,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                height: 96,
                gap: 6,
                paddingBottom: 4,
              }}
            >
              {CANDLESTICKS.map((c, i) => {
                const scaleH = (v: number) => (v / 82) * 92;
                const bodyTop    = Math.max(c.o, c.c);
                const bodyBot    = Math.min(c.o, c.c);
                const bodyHeight = Math.max(scaleH(bodyTop - bodyBot), 3);
                const color      = c.bull ? "#00C17C" : "#E5484D";
                const delay      = `${i * 0.06}s`;

                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      height: "100%",
                      opacity: visible ? 1 : 0,
                      transform: visible ? "scaleY(1)" : "scaleY(0)",
                      transformOrigin: "bottom",
                      transition: `opacity 0.4s ease ${delay}, transform 0.4s ease ${delay}`,
                      position: "relative",
                    }}
                  >
                    {/* Wick */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: `${scaleH(c.l)}px`,
                        width: 1,
                        height: `${scaleH(c.h - c.l)}px`,
                        background: color,
                        opacity: 0.6,
                      }}
                    />
                    {/* Body */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: `${scaleH(bodyBot)}px`,
                        width: "70%",
                        height: `${bodyHeight}px`,
                        background: color,
                        borderRadius: 2,
                        opacity: 0.9,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(229,72,77,0.7)",
                letterSpacing: "0.1em",
                textAlign: "right",
                fontFamily: "'Courier New', monospace",
                marginTop: 6,
              }}
            >
              404 / ROUTE_NOT_FOUND — drawdown máximo alcanzado
            </div>
          </div>

          {/* Error output */}
          <div style={{ padding: "20px 24px 8px", fontFamily: "'Courier New', monospace" }}>
            <div style={{ color: "rgba(242,243,244,0.4)", fontSize: 12, marginBottom: 6 }}>
              $ zen-trade execute --route &quot;{typeof window !== "undefined" ? window.location.pathname : "/..."}&quot;
            </div>
            <div style={{ color: "#E5484D", fontSize: 12, marginBottom: 3 }}>
              ✗ ORDER REJECTED — position does not exist
            </div>
            <div style={{ color: "rgba(242,243,244,0.4)", fontSize: 12, marginBottom: 2 }}>
              &nbsp;&nbsp;error_code: HTTP_404
            </div>
            <div style={{ color: "rgba(242,243,244,0.4)", fontSize: 12, marginBottom: 16 }}>
              &nbsp;&nbsp;suggestion: navigate to a valid route{" "}
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 13,
                  background: "#00C17C",
                  verticalAlign: "middle",
                  opacity: tick % 2 === 0 ? 1 : 0,
                  transition: "opacity 0.1s",
                }}
              />
            </div>
          </div>

          {/* Status badges */}
          <div
            style={{
              padding: "0 24px 24px",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {[
              { label: "STATUS",    val: "CLOSED",      col: "#E5484D" },
              { label: "ENTRY",     val: "NOT FOUND",   col: "#F5A623" },
              { label: "PNL",       val: "—",           col: "rgba(242,243,244,0.4)" },
              { label: "SESSION",   val: "ACTIVE",      col: "#00C17C" },
            ].map((b) => (
              <div
                key={b.label}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  display: "flex",
                  gap: 6,
                }}
              >
                <span style={{ color: "rgba(242,243,244,0.4)" }}>{b.label}</span>
                <span style={{ color: b.col, fontWeight: 700 }}>{b.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 404 hero number */}
        <div
          style={{
            marginTop: 40,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "clamp(80px, 18vw, 160px)",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              background: "linear-gradient(135deg, #00C17C 0%, #3DBB8F 40%, rgba(0,193,124,0.2) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "glitch-404 6s ease-in-out infinite",
              userSelect: "none",
            }}
          >
            404
          </div>
          <p
            style={{
              marginTop: 12,
              fontSize: 15,
              color: "rgba(242,243,244,0.55)",
              maxWidth: 360,
              margin: "12px auto 0",
              lineHeight: 1.6,
            }}
          >
            Esta página no existe — como una trade que nunca encontró contraparte.
          </p>
        </div>

        {/* CTA buttons */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#00C17C",
              color: "#001B1F",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.02em",
              padding: "12px 24px",
              borderRadius: 8,
              textDecoration: "none",
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.88";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M2 8l4-4M2 8l4 4" stroke="#001B1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver al Dashboard
          </Link>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              color: "rgba(242,243,244,0.7)",
              fontWeight: 600,
              fontSize: 14,
              padding: "12px 24px",
              borderRadius: 8,
              textDecoration: "none",
              border: "1px solid rgba(242,243,244,0.12)",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,193,124,0.4)";
              (e.currentTarget as HTMLElement).style.color = "#F2F3F4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(242,243,244,0.12)";
              (e.currentTarget as HTMLElement).style.color = "rgba(242,243,244,0.7)";
            }}
          >
            Ir al Inicio
          </Link>
        </div>

        {/* Bottom meta */}
        <div
          style={{
            marginTop: 48,
            fontSize: 11,
            color: "rgba(242,243,244,0.2)",
            letterSpacing: "0.1em",
            textAlign: "center",
          }}
        >
          ZENTRADE © 2026 — zen-trader.com
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        @keyframes glitch-404 {
          0%, 90%, 100% {
            clip-path: none;
            transform: none;
            filter: none;
          }
          92% {
            clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%);
            transform: translateX(-4px);
            filter: hue-rotate(45deg) saturate(2);
          }
          93% {
            clip-path: polygon(0 55%, 100% 55%, 100% 75%, 0 75%);
            transform: translateX(4px);
            filter: hue-rotate(-45deg);
          }
          94% {
            clip-path: none;
            transform: none;
            filter: none;
          }
          96% {
            clip-path: polygon(0 10%, 100% 10%, 100% 25%, 0 25%);
            transform: translateX(-2px);
          }
          97% {
            clip-path: none;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
