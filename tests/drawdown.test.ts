import { describe, expect, it } from 'vitest';
import { computeDrawdownStatus, computePeakBalance } from '@/lib/utils/drawdown';

// Caso real del QA: cuenta Apex 50k, DD trailing 2,500.
// Trades: +180, -120, -400, -650, +520, +250 → pico 50,180, balance 49,780.
const trades = [
  { trade_date: '2026-11-17', created_at: '2026-11-20T18:52:00Z', result: 180 },
  { trade_date: '2026-11-17', created_at: '2026-11-20T18:52:01Z', result: -120 },
  { trade_date: '2026-11-18', created_at: '2026-11-20T18:52:02Z', result: -400 },
  { trade_date: '2026-11-18', created_at: '2026-11-20T18:52:03Z', result: -650 },
  { trade_date: '2026-11-19', created_at: '2026-11-20T18:52:04Z', result: 520 },
  { trade_date: '2026-11-20', created_at: '2026-11-20T18:51:16Z', result: 250 },
];

describe('computePeakBalance', () => {
  it('encuentra el pico respetando el orden cronológico', () => {
    expect(computePeakBalance(50000, trades)).toBe(50180);
  });
  it('sin trades el pico es el balance inicial', () => {
    expect(computePeakBalance(50000, [])).toBe(50000);
  });
});

describe('computeDrawdownStatus', () => {
  it('trailing: el piso sube con el pico (2,100 disponibles, no 2,280)', () => {
    const s = computeDrawdownStatus({
      startingBalance: 50000, currentBalance: 49780, maxDrawdown: 2500, drawdownType: 'trailing', peakBalance: 50180,
    });
    expect(s.floor).toBe(47680);
    expect(s.remaining).toBe(2100);
    expect(s.usedPercent).toBeCloseTo(16, 5);
  });

  it('trailing: el piso se congela en el balance inicial', () => {
    const s = computeDrawdownStatus({
      startingBalance: 50000, currentBalance: 53000, maxDrawdown: 2500, drawdownType: 'trailing', peakBalance: 54000,
    });
    expect(s.floor).toBe(50000);
    expect(s.remaining).toBe(3000);
  });

  it('static: el piso no se mueve', () => {
    const s = computeDrawdownStatus({
      startingBalance: 50000, currentBalance: 49780, maxDrawdown: 2500, drawdownType: 'static', peakBalance: 50180,
    });
    expect(s.floor).toBe(47500);
    expect(s.remaining).toBe(2280);
  });
});
