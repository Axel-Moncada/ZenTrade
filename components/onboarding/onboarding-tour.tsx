"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import type { PopoverDOM, State } from "driver.js";
import "driver.js/dist/driver.css";

interface OnboardingTourProps {
  hasCompletedTour: boolean;
}

const STEP_ICONS = ["👋", "💼", "📊", "📅", "📈", "🎯", "🚀"];

export function OnboardingTour({ hasCompletedTour }: OnboardingTourProps) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const driverRef = useRef<import("driver.js").Driver | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (hasCompletedTour) return;
    completedRef.current = false;

    const tt = t.tour;
    const TOTAL = 7;

    const stepsData = [
      { title: tt.welcome.title, desc: tt.welcome.description },
      { title: tt.accounts.title, desc: tt.accounts.description },
      { title: tt.trades.title, desc: tt.trades.description },
      { title: tt.calendar.title, desc: tt.calendar.description },
      { title: tt.dashboard.title, desc: tt.dashboard.description },
      { title: tt.tradingPlan.title, desc: tt.tradingPlan.description },
      { title: tt.final.title, desc: tt.final.description },
    ];

    const markComplete = async () => {
      if (completedRef.current) return;
      completedRef.current = true;
      await fetch("/api/onboarding/complete", { method: "POST" });
    };

    async function startTour() {
      const { driver } = await import("driver.js");
      driverRef.current?.destroy();

      driverRef.current = driver({
        allowClose: true,
        overlayOpacity: 0.62,
        smoothScroll: true,
        stagePadding: 10,
        stageRadius: 12,
        onPopoverRender: (popoverDom: PopoverDOM, { state }: { state: State }) => {
          const { wrapper, arrow } = popoverDom;
          const step = state.activeIndex ?? 0;
          const isLast = step === TOTAL - 1;
          const isFirst = step === 0;
          const { title, desc } = stepsData[step];
          const icon = STEP_ICONS[step];
          const progressPct = Math.round(((step + 1) / TOTAL) * 100);

          Array.from(wrapper.children).forEach((child) => {
            if (child !== arrow) wrapper.removeChild(child);
          });

          const card = document.createElement("div");
          card.style.cssText = [
            "padding: 0",
            "box-sizing: border-box",
            "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            "overflow: hidden",
            "border-radius: 18px",
          ].join(";");

          card.innerHTML = `
            <!-- Top accent bar -->
            <div style="
              height: 3px;
              background: linear-gradient(90deg, #006A4E 0%, #00C17C 45%, #3DBB8F 80%, #006A4E 100%);
              border-radius: 18px 18px 0 0;
            "></div>

            <!-- Content -->
            <div style="padding: 24px 28px 26px;">

              <!-- Header row -->
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <div style="
                    width:40px; height:40px;
                    background: rgba(0,193,124,0.12);
                    border: 1px solid rgba(0,193,124,0.25);
                    border-radius: 12px;
                    display:flex; align-items:center; justify-content:center;
                    font-size: 20px; line-height:1;
                  ">${icon}</div>
                  <div>
                    <div style="
                      color: rgba(0,193,124,0.8);
                      font-size: 10px;
                      font-weight: 700;
                      letter-spacing: 1.2px;
                      text-transform: uppercase;
                      margin-bottom: 2px;
                    ">ZENTRADE TOUR</div>
                    <div style="
                      color: rgba(242,243,244,0.35);
                      font-size: 11px;
                      font-weight: 500;
                    ">${tt.of.replace("de", "").replace("of", "").trim()} ${step + 1} ${tt.of} ${TOTAL}</div>
                  </div>
                </div>
                <button class="zt-close-btn" style="
                  background: transparent;
                  border: none;
                  color: rgba(242,243,244,0.28);
                  font-size: 22px;
                  cursor: pointer;
                  padding: 4px 6px;
                  line-height: 1;
                  border-radius: 8px;
                  transition: all 0.15s ease;
                " title="Close">×</button>
              </div>

              <!-- Title -->
              <h3 style="
                color: #F2F3F4;
                font-size: 19px;
                font-weight: 700;
                margin: 0 0 10px 0;
                line-height: 1.25;
                letter-spacing: -0.4px;
              ">${title}</h3>

              <!-- Description -->
              <p style="
                color: rgba(242,243,244,0.72);
                font-size: 14px;
                line-height: 1.72;
                margin: 0 0 24px 0;
              ">${desc}</p>

              <!-- Progress bar -->
              <div style="
                height: 4px;
                background: rgba(0,193,124,0.1);
                border-radius: 4px;
                margin-bottom: 22px;
                overflow: hidden;
              ">
                <div style="
                  height: 100%;
                  width: ${progressPct}%;
                  background: linear-gradient(90deg, #006A4E, #00C17C, #3DBB8F);
                  border-radius: 4px;
                  box-shadow: 0 0 8px rgba(0,193,124,0.5);
                  transition: width 0.45s cubic-bezier(0.4,0,0.2,1);
                "></div>
              </div>

              <!-- Footer -->
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <!-- Step dots -->
                <div style="display:flex; gap:5px; align-items:center;">
                  ${Array.from({ length: TOTAL }, (_, i) => `
                    <div style="
                      width: ${i === step ? '18px' : '6px'};
                      height: 6px;
                      border-radius: 3px;
                      background: ${i === step ? '#00C17C' : i < step ? 'rgba(0,193,124,0.35)' : 'rgba(242,243,244,0.12)'};
                      transition: all 0.3s ease;
                    "></div>
                  `).join("")}
                </div>

                <!-- Buttons -->
                <div style="display:flex; gap:8px; align-items:center;">
                  ${!isFirst ? `<button class="zt-prev-btn" style="
                    background: rgba(0,193,124,0.08);
                    border: 1px solid rgba(0,193,124,0.28);
                    color: #00C17C;
                    font-size: 13px;
                    font-weight: 500;
                    padding: 9px 18px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-family: inherit;
                  ">${tt.prev}</button>` : ""}
                  <button class="zt-next-btn" style="
                    background: #00C17C;
                    border: 1.5px solid #00C17C;
                    color: #001B1F;
                    font-size: 13px;
                    font-weight: 700;
                    padding: 9px 22px;
                    border-radius: 10px;
                    cursor: pointer;
                    box-shadow: 0 0 18px rgba(0,193,124,0.5), 0 4px 12px rgba(0,0,0,0.3);
                    font-family: inherit;
                    letter-spacing: 0.1px;
                  ">${isLast ? tt.done : tt.next}</button>
                </div>
              </div>

            </div>
          `;

          wrapper.insertBefore(card, arrow);

          // Step counter text — replace "X de Y" with just the icon
          const stepText = card.querySelector<HTMLDivElement>("[data-step-text]");
          if (stepText) stepText.textContent = `${step + 1} ${tt.of} ${TOTAL}`;

          card.querySelector(".zt-close-btn")?.addEventListener("click", async () => {
            driverRef.current?.destroy();
            await markComplete();
          });

          card.querySelector(".zt-prev-btn")?.addEventListener("click", () => {
            driverRef.current?.movePrevious();
          });

          card.querySelector(".zt-next-btn")?.addEventListener("click", async () => {
            if (isLast) {
              driverRef.current?.destroy();
              await markComplete();
              router.push("/dashboard/accounts");
            } else {
              driverRef.current?.moveNext();
            }
          });
        },
        onDestroyStarted: async () => {
          await markComplete();
          driverRef.current?.destroy();
        },
        steps: [
          { popover: {} },
          {
            element: '[data-tour="nav-accounts"]',
            popover: { side: "right" as const, align: "center" as const },
          },
          {
            element: '[data-tour="nav-trades"]',
            popover: { side: "right" as const, align: "center" as const },
          },
          {
            element: '[data-tour="nav-calendar"]',
            popover: { side: "right" as const, align: "center" as const },
          },
          {
            element: '[data-tour="nav-dashboard"]',
            popover: { side: "right" as const, align: "center" as const },
          },
          {
            element: '[data-tour="nav-trading-plan"]',
            popover: { side: "right" as const, align: "center" as const },
          },
          {
            element: '[data-tour="nav-accounts"]',
            popover: { side: "right" as const, align: "center" as const },
          },
        ],
      });

      driverRef.current.drive();
    }

    startTour();

    return () => {
      driverRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompletedTour, locale]);

  return null;
}
