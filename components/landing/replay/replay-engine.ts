// Motor del "Replay this day": datos demo y geometría pura (sin React).
// Cuenta demo: evaluación 50K con trailing drawdown de $2,000 (regla de Apex verificada el 2026-11-22).

export type ReplayMode = "fail" | "save";
type Point = readonly [minute: number, pnl: number];

export const TRAILING_DRAWDOWN = 2000;
export const BREACH_MINUTE = 68; // 10:38
export const ALERT_MINUTE = 54; // 10:24
export const END_SAVE_MINUTE = 90; // 11:00
const LOSS_START = 45; // 10:15, pico del día

export const FAIL: readonly Point[] = [
  [0, 0], [6, 240], [12, 170], [20, 520], [28, 610], [36, 900], [45, 1240],
  [52, 1060], [54, 640], [57, 80], [61, -390], [68, -800],
];
export const SAVE: readonly Point[] = [
  [0, 0], [6, 240], [12, 170], [20, 520], [28, 610], [36, 900], [45, 1240],
  [52, 1060], [90, 1060],
];
const LOSSES_FAIL: readonly (readonly [number, string])[] = [
  [52, "-$180"], [54, "-$420"], [57, "-$560"], [61, "-$470"], [68, "-$410"],
];
const LOSSES_SAVE: readonly (readonly [number, string])[] = [[52, "-$180"]];

const X = (m: number) => 40 + (m / 90) * 580;
const Y = (v: number) => 14 + ((1600 - v) / 4400) * 300;

export function valAt(pts: readonly Point[], m: number): number {
  for (let i = 1; i < pts.length; i++) {
    if (m <= pts[i][0]) {
      const a = pts[i - 1];
      const b = pts[i];
      const k = (m - a[0]) / (b[0] - a[0] || 1);
      return a[1] + (b[1] - a[1]) * k;
    }
  }
  return pts[pts.length - 1][1];
}

function visible(pts: readonly Point[], m: number, from = 0): Point[] {
  if (m < from) return [];
  const out: Point[] = [[from, valAt(pts, from)]];
  pts.forEach((p) => {
    if (p[0] > from && p[0] < m) out.push(p);
  });
  out.push([m, valAt(pts, m)]);
  return out;
}

const toPath = (arr: Point[]) =>
  arr.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(" ");

export const formatPnl = (v: number) =>
  `${v < 0 ? "-$" : "+$"}${Math.abs(Math.round(v)).toLocaleString("en-US")}`;
export const formatUsd = (v: number) => `$${Math.max(0, Math.round(v)).toLocaleString("en-US")}`;

export function clockAt(m: number): string {
  const t = 570 + Math.floor(m); // 9:30 ET
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

export interface ReplayFrame {
  pnl: number;
  toFloor: number;
  zeroY: number;
  floorPath: string;
  floorLabelY: number;
  greenPath: string;
  redPath: string;
  marks: { x: number; y: number; ty: number; label: string }[];
  headX: number;
  headY: number;
  headRed: boolean;
}

export function computeFrame(mode: ReplayMode, m: number): ReplayFrame {
  const pts = mode === "fail" ? FAIL : SAVE;
  const all = visible(pts, m);
  let peak = -Infinity;
  const floorPts: Point[] = all.map((p) => {
    peak = Math.max(peak, p[1]);
    return [p[0], peak - TRAILING_DRAWDOWN];
  });
  const floorPath = floorPts
    .map((p, i) =>
      i ? `H${X(p[0]).toFixed(1)} V${Y(p[1]).toFixed(1)}` : `M${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`
    )
    .join(" ");
  const v = valAt(pts, m);
  const floorNow = floorPts.length ? floorPts[floorPts.length - 1][1] : -TRAILING_DRAWDOWN;

  const green = visible(pts, Math.min(m, LOSS_START));
  const red = m > LOSS_START ? visible(pts, mode === "fail" ? m : Math.min(m, 52), LOSS_START) : [];
  const greenAfter = mode === "save" && m > 52 ? visible(pts, m, 52) : [];

  const losses = (mode === "fail" ? LOSSES_FAIL : LOSSES_SAVE).filter((l) => m >= l[0]);
  const marks = losses.map((l, i) => {
    const y = Y(valAt(pts, l[0]));
    return { x: X(l[0]), y, ty: y + (i % 2 ? 22 : -12), label: l[1] };
  });

  return {
    pnl: v,
    toFloor: v - floorNow,
    zeroY: Y(0),
    floorPath,
    floorLabelY: Y(floorNow) + 16,
    greenPath: toPath(green) + (greenAfter.length ? ` ${toPath(greenAfter)}` : ""),
    redPath: red.length ? toPath(red) : "",
    marks,
    headX: X(m),
    headY: Y(v),
    headRed: mode === "fail" && m > LOSS_START,
  };
}
