import { describe, expect, it } from "vitest";
import { computeConsistency, parseDailyPnl } from "@/lib/tools/consistency";

describe("parseDailyPnl", () => {
  it("acepta comas, saltos de línea y signos de dólar", () => {
    expect(parseDailyPnl("250, -120\n$400 ; 80")).toEqual([250, -120, 400, 80]);
  });
  it("ignora valores no numéricos", () => {
    expect(parseDailyPnl("100 abc 50")).toEqual([100, 50]);
  });
});

describe("computeConsistency", () => {
  it("cumple cuando el mejor día está bajo el umbral", () => {
    const r = computeConsistency([300, 250, 200, 250], 50);
    expect(r.netProfit).toBe(1000);
    expect(r.bestDay).toBe(300);
    expect(r.bestDayShare).toBeCloseTo(30);
    expect(r.passes).toBe(true);
    expect(r.extraProfitNeeded).toBe(0);
  });
  it("calcula la ganancia extra necesaria cuando no cumple", () => {
    const r = computeConsistency([1200, -200, 200], 50);
    expect(r.netProfit).toBe(1200);
    expect(r.passes).toBe(false);
    expect(r.requiredNetProfit).toBe(2400);
    expect(r.extraProfitNeeded).toBe(1200);
  });
  it("no cumple con ganancia neta negativa", () => {
    const r = computeConsistency([-100, -50], 30);
    expect(r.passes).toBe(false);
    expect(r.bestDayShare).toBeNull();
  });
});
