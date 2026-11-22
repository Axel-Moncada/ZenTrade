// Eventos de conversión para GA4 (y Google Ads / Meta si sus tags están cargados).
// No rompe nada si los scripts no cargaron (bloqueadores, preview, SSR).

export type TrackEvent =
  | "cta_click"
  | "replay_save_started"
  | "calculator_used"
  | "video_play"
  | "sign_up";

type EventParams = Record<string, string | number | boolean | undefined>;

type Gtag = (command: "event", name: string, params?: EventParams) => void;
type Fbq = (command: "track" | "trackCustom", name: string, params?: EventParams) => void;

interface AnalyticsWindow {
  gtag?: Gtag;
  fbq?: Fbq;
}

export function track(event: TrackEvent, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as AnalyticsWindow;
  try {
    w.gtag?.("event", event, params);
    if (w.fbq) {
      if (event === "sign_up") w.fbq("track", "CompleteRegistration", params);
      else w.fbq("trackCustom", event, params);
    }
  } catch {
    // La analítica nunca debe romper la UI
  }
}
