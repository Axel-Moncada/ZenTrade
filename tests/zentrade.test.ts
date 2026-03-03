import { describe, it, expect } from 'vitest';
import { calculateDashboardStats } from '@/lib/utils/dashboard-calculations';
import { createAccountSchema, updateAccountSchema } from '@/lib/validations/account.schema';
import { createTradeSchema, updateTradeSchema } from '@/lib/validations/trade.schema';
import type { TradeWithInstrument } from '@/types/trades';

// ── Trade factory ───────────────────────────────────────────────────────────

let _id = 0;
function makeTrade(overrides: Partial<TradeWithInstrument> = {}): TradeWithInstrument {
  _id++;
  return {
    id: `trade-${_id}`,
    user_id: 'user-1',
    account_id: 'acc-1',
    instrument_id: 'inst-1',
    trade_date: '2024-01-15',
    contracts: 1,
    side: 'long',
    result: 100,
    exit_reason: 'take_profit',
    followed_plan: true,
    emotions: null,
    notes: null,
    screenshot_url: null,
    entry_time: null,
    exit_time: null,
    screenshot_urls: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    instrument: {
      symbol: 'ES',
      name: 'E-mini S&P 500',
      tick_size: 0.25,
      tick_value: 12.5,
    },
    ...overrides,
  };
}

// ── calculateDashboardStats ─────────────────────────────────────────────────

describe('calculateDashboardStats', () => {

  // ── Empty input ──────────────────────────────────────────────────────────

  describe('empty input', () => {
    it('returns zero stats for empty trades array', () => {
      const stats = calculateDashboardStats([]);
      expect(stats.totalTrades).toBe(0);
      expect(stats.totalPnl).toBe(0);
      expect(stats.winRate).toBe(0);
      expect(stats.profitFactor).toBe(0);
      expect(stats.averagePerTrade).toBe(0);
      expect(stats.maxGain).toBe(0);
      expect(stats.maxLoss).toBe(0);
      expect(stats.bestDay).toBeNull();
      expect(stats.worstDay).toBeNull();
      expect(stats.currentStreak).toEqual({ type: 'none', count: 0 });
      expect(stats.equityCurve).toEqual([]);
      expect(stats.winsLossesByDay).toEqual([]);
      expect(stats.emotionsDistribution).toEqual([]);
      expect(stats.exitReasonsDistribution).toEqual([]);
      expect(stats.instrumentStats).toEqual([]);
    });
  });

  // ── Single trade ─────────────────────────────────────────────────────────

  describe('single trade', () => {
    it('winning trade — 100% win rate, Infinity profit factor', () => {
      const stats = calculateDashboardStats([makeTrade({ result: 500 })]);
      expect(stats.totalTrades).toBe(1);
      expect(stats.winningTrades).toBe(1);
      expect(stats.losingTrades).toBe(0);
      expect(stats.totalPnl).toBe(500);
      expect(stats.winRate).toBe(100);
      expect(stats.profitFactor).toBe(Infinity);
      expect(stats.maxGain).toBe(500);
      expect(stats.maxLoss).toBe(0);
    });

    it('losing trade — 0% win rate, 0 profit factor', () => {
      const stats = calculateDashboardStats([makeTrade({ result: -300 })]);
      expect(stats.totalTrades).toBe(1);
      expect(stats.winningTrades).toBe(0);
      expect(stats.losingTrades).toBe(1);
      expect(stats.totalPnl).toBe(-300);
      expect(stats.winRate).toBe(0);
      expect(stats.profitFactor).toBe(0);
      expect(stats.maxGain).toBe(0);
      expect(stats.maxLoss).toBe(-300);
    });

    it('breakeven trade (result=0) is counted in neither wins nor losses', () => {
      const stats = calculateDashboardStats([makeTrade({ result: 0 })]);
      expect(stats.winningTrades).toBe(0);
      expect(stats.losingTrades).toBe(0);
      expect(stats.profitFactor).toBe(0);
    });
  });

  // ── KPI calculations ─────────────────────────────────────────────────────

  describe('KPI calculations with mixed trades', () => {
    const trades = [
      makeTrade({ result: 400, trade_date: '2024-01-15' }),
      makeTrade({ result: 200, trade_date: '2024-01-15' }),
      makeTrade({ result: -150, trade_date: '2024-01-16' }),
      makeTrade({ result: -100, trade_date: '2024-01-16' }),
      makeTrade({ result: 300, trade_date: '2024-01-17' }),
    ];

    it('computes totalPnl correctly', () => {
      expect(calculateDashboardStats(trades).totalPnl).toBe(650);
    });

    it('computes win rate: 3/5 = 60%', () => {
      expect(calculateDashboardStats(trades).winRate).toBeCloseTo(60);
    });

    it('computes profit factor: gross_wins/gross_losses = 900/250', () => {
      expect(calculateDashboardStats(trades).profitFactor).toBeCloseTo(900 / 250);
    });

    it('computes averagePerTrade: 650/5 = 130', () => {
      expect(calculateDashboardStats(trades).averagePerTrade).toBeCloseTo(130);
    });

    it('finds maxGain = 400, maxLoss = -150', () => {
      const stats = calculateDashboardStats(trades);
      expect(stats.maxGain).toBe(400);
      expect(stats.maxLoss).toBe(-150);
    });

    it('identifies best day (2024-01-15 → PNL 600)', () => {
      const stats = calculateDashboardStats(trades);
      expect(stats.bestDay?.date).toBe('2024-01-15');
      expect(stats.bestDay?.pnl).toBe(600);
    });

    it('identifies worst day among losing days (2024-01-16 → PNL -250)', () => {
      const stats = calculateDashboardStats(trades);
      expect(stats.worstDay?.date).toBe('2024-01-16');
      expect(stats.worstDay?.pnl).toBe(-250);
    });

    it('worstDay is null when all days are profitable', () => {
      const profitableTrades = [
        makeTrade({ result: 100, trade_date: '2024-01-15' }),
        makeTrade({ result: 200, trade_date: '2024-01-16' }),
      ];
      const stats = calculateDashboardStats(profitableTrades);
      expect(stats.worstDay).toBeNull();
    });
  });

  // ── Equity curve ─────────────────────────────────────────────────────────

  describe('equity curve', () => {
    it('builds cumulative equity curve sorted by date', () => {
      const trades = [
        makeTrade({ result: 100, trade_date: '2024-01-15' }),
        makeTrade({ result: -50, trade_date: '2024-01-16' }),
        makeTrade({ result: 200, trade_date: '2024-01-17' }),
      ];
      const { equityCurve } = calculateDashboardStats(trades);
      expect(equityCurve).toHaveLength(3);
      expect(equityCurve[0]).toEqual({ date: '2024-01-15', cumulativePnl: 100, dailyPnl: 100 });
      expect(equityCurve[1]).toEqual({ date: '2024-01-16', cumulativePnl: 50, dailyPnl: -50 });
      expect(equityCurve[2]).toEqual({ date: '2024-01-17', cumulativePnl: 250, dailyPnl: 200 });
    });

    it('aggregates multiple trades on the same day into one curve point', () => {
      const trades = [
        makeTrade({ result: 100, trade_date: '2024-01-15' }),
        makeTrade({ result: 200, trade_date: '2024-01-15' }),
      ];
      const { equityCurve } = calculateDashboardStats(trades);
      expect(equityCurve).toHaveLength(1);
      expect(equityCurve[0].dailyPnl).toBe(300);
      expect(equityCurve[0].cumulativePnl).toBe(300);
    });
  });

  // ── Current streak ───────────────────────────────────────────────────────

  describe('current streak', () => {
    it('detects winning streak of 3', () => {
      const trades = [
        makeTrade({ result: -100, trade_date: '2024-01-13' }),
        makeTrade({ result: 200, trade_date: '2024-01-14' }),
        makeTrade({ result: 150, trade_date: '2024-01-15' }),
        makeTrade({ result: 300, trade_date: '2024-01-16' }),
      ];
      const { currentStreak } = calculateDashboardStats(trades);
      expect(currentStreak.type).toBe('winning');
      expect(currentStreak.count).toBe(3);
    });

    it('detects losing streak of 2', () => {
      const trades = [
        makeTrade({ result: 500, trade_date: '2024-01-13' }),
        makeTrade({ result: -100, trade_date: '2024-01-14' }),
        makeTrade({ result: -200, trade_date: '2024-01-15' }),
      ];
      const { currentStreak } = calculateDashboardStats(trades);
      expect(currentStreak.type).toBe('losing');
      expect(currentStreak.count).toBe(2);
    });

    it('single trade is a streak of 1', () => {
      const { currentStreak } = calculateDashboardStats([makeTrade({ result: 100 })]);
      expect(currentStreak.type).toBe('winning');
      expect(currentStreak.count).toBe(1);
    });
  });

  // ── Plan adherence ───────────────────────────────────────────────────────

  describe('plan adherence', () => {
    it('calculates adherence rate: 2/3 ≈ 66.67%', () => {
      const trades = [
        makeTrade({ followed_plan: true }),
        makeTrade({ followed_plan: true }),
        makeTrade({ followed_plan: false }),
      ];
      const stats = calculateDashboardStats(trades);
      expect(stats.tradesFollowingPlan).toBe(2);
      expect(stats.planAdherenceRate).toBeCloseTo(66.67, 1);
    });

    it('100% adherence when all trades follow plan', () => {
      const trades = [makeTrade({ followed_plan: true }), makeTrade({ followed_plan: true })];
      expect(calculateDashboardStats(trades).planAdherenceRate).toBe(100);
    });
  });

  // ── Emotions distribution ────────────────────────────────────────────────

  describe('emotions distribution', () => {
    it('counts emotions across trades and sorts by frequency', () => {
      const trades = [
        makeTrade({ emotions: ['disciplinado', 'confiado'] }),
        makeTrade({ emotions: ['disciplinado', 'ansioso'] }),
        makeTrade({ emotions: ['disciplinado'] }),
      ];
      const { emotionsDistribution } = calculateDashboardStats(trades);
      // disciplinado:3, confiado:1, ansioso:1
      expect(emotionsDistribution[0].emotion).toBe('disciplinado');
      expect(emotionsDistribution[0].count).toBe(3);
      expect(emotionsDistribution[0].percentage).toBeCloseTo(60);
    });

    it('ignores trades with null emotions', () => {
      const trades = [makeTrade({ emotions: null }), makeTrade({ emotions: ['miedo'] })];
      const { emotionsDistribution } = calculateDashboardStats(trades);
      expect(emotionsDistribution).toHaveLength(1);
      expect(emotionsDistribution[0].emotion).toBe('miedo');
    });

    it('returns empty array when no trades have emotions', () => {
      const trades = [makeTrade({ emotions: null }), makeTrade({ emotions: null })];
      expect(calculateDashboardStats(trades).emotionsDistribution).toHaveLength(0);
    });
  });

  // ── Exit reasons ─────────────────────────────────────────────────────────

  describe('exit reasons distribution', () => {
    it('counts exit reasons and sorts by frequency', () => {
      const trades = [
        makeTrade({ exit_reason: 'take_profit' }),
        makeTrade({ exit_reason: 'take_profit' }),
        makeTrade({ exit_reason: 'stop_loss' }),
      ];
      const { exitReasonsDistribution } = calculateDashboardStats(trades);
      expect(exitReasonsDistribution[0].reason).toBe('take_profit');
      expect(exitReasonsDistribution[0].count).toBe(2);
      expect(exitReasonsDistribution[0].percentage).toBeCloseTo(66.7, 0);
    });

    it('ignores trades with null exit_reason', () => {
      const trades = [makeTrade({ exit_reason: null }), makeTrade({ exit_reason: 'manual' })];
      const { exitReasonsDistribution } = calculateDashboardStats(trades);
      expect(exitReasonsDistribution).toHaveLength(1);
    });
  });

  // ── Instrument stats ─────────────────────────────────────────────────────

  describe('instrument stats', () => {
    const nqInstrument = { symbol: 'NQ', name: 'Nasdaq-100', tick_size: 0.25, tick_value: 5 };
    const esInstrument = { symbol: 'ES', name: 'E-mini S&P 500', tick_size: 0.25, tick_value: 12.5 };

    it('groups by symbol and sorts by totalPnl descending', () => {
      const trades = [
        makeTrade({ result: 200, instrument: nqInstrument }),
        makeTrade({ result: 100, instrument: nqInstrument }),
        makeTrade({ result: 500, instrument: esInstrument }),
      ];
      const { instrumentStats } = calculateDashboardStats(trades);
      expect(instrumentStats).toHaveLength(2);
      expect(instrumentStats[0].symbol).toBe('ES');
      expect(instrumentStats[0].totalPnl).toBe(500);
      expect(instrumentStats[1].symbol).toBe('NQ');
      expect(instrumentStats[1].totalPnl).toBe(300);
    });

    it('computes per-instrument win rate correctly', () => {
      const trades = [
        makeTrade({ result: 100, instrument: nqInstrument }),
        makeTrade({ result: -50, instrument: nqInstrument }),
        makeTrade({ result: 200, instrument: nqInstrument }),
      ];
      const { instrumentStats } = calculateDashboardStats(trades);
      expect(instrumentStats[0].winRate).toBeCloseTo(66.7, 0);
      expect(instrumentStats[0].winningTrades).toBe(2);
      expect(instrumentStats[0].losingTrades).toBe(1);
    });
  });

});

// ── createAccountSchema ─────────────────────────────────────────────────────

describe('createAccountSchema', () => {
  const valid = {
    name: 'FTMO 50k',
    account_type: 'evaluation' as const,
    initial_balance: 50000,
    starting_balance: 50000,
    drawdown_type: 'trailing' as const,
    max_drawdown: 2500,
    start_date: '2024-01-01',
  };

  it('accepts valid account data', () => {
    expect(createAccountSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts optional fields (broker, platform, notes)', () => {
    const result = createAccountSchema.safeParse({
      ...valid,
      broker: 'FTMO',
      platform: 'NinjaTrader',
      notes: 'Test account',
      profit_target: 3000,
      buffer_amount: 500,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createAccountSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain('name');
  });

  it('rejects name exceeding 100 characters', () => {
    expect(createAccountSchema.safeParse({ ...valid, name: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects invalid account_type', () => {
    expect(createAccountSchema.safeParse({ ...valid, account_type: 'demo' }).success).toBe(false);
  });

  it('rejects invalid drawdown_type', () => {
    expect(createAccountSchema.safeParse({ ...valid, drawdown_type: 'dynamic' }).success).toBe(false);
  });

  it('rejects negative initial_balance', () => {
    expect(createAccountSchema.safeParse({ ...valid, initial_balance: -100 }).success).toBe(false);
  });

  it('rejects zero initial_balance', () => {
    expect(createAccountSchema.safeParse({ ...valid, initial_balance: 0 }).success).toBe(false);
  });

  it('rejects max_drawdown greater than initial_balance', () => {
    const result = createAccountSchema.safeParse({
      ...valid,
      initial_balance: 5000,
      starting_balance: 5000,
      max_drawdown: 6000,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain('max_drawdown');
  });

  it('accepts max_drawdown equal to initial_balance', () => {
    const result = createAccountSchema.safeParse({
      ...valid,
      initial_balance: 5000,
      starting_balance: 5000,
      max_drawdown: 5000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid date format (MM/DD/YYYY)', () => {
    expect(createAccountSchema.safeParse({ ...valid, start_date: '01/15/2024' }).success).toBe(false);
  });

  it('rejects notes exceeding 2000 characters', () => {
    expect(createAccountSchema.safeParse({ ...valid, notes: 'x'.repeat(2001) }).success).toBe(false);
  });
});

// ── updateAccountSchema ─────────────────────────────────────────────────────

describe('updateAccountSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(updateAccountSchema.safeParse({}).success).toBe(true);
  });

  it('accepts partial update with only name', () => {
    expect(updateAccountSchema.safeParse({ name: 'Updated Name' }).success).toBe(true);
  });

  it('accepts partial update with only status', () => {
    expect(updateAccountSchema.safeParse({ status: 'passed' }).success).toBe(true);
  });

  it('rejects invalid status value', () => {
    expect(updateAccountSchema.safeParse({ status: 'archived' }).success).toBe(false);
  });

  it('validates max_drawdown vs initial_balance when both present', () => {
    const result = updateAccountSchema.safeParse({ initial_balance: 1000, max_drawdown: 2000 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain('max_drawdown');
  });

  it('allows max_drawdown alone without initial_balance', () => {
    expect(updateAccountSchema.safeParse({ max_drawdown: 999 }).success).toBe(true);
  });
});

// ── createTradeSchema ───────────────────────────────────────────────────────

describe('createTradeSchema', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';
  const validUUID2 = '223e4567-e89b-12d3-a456-426614174001';

  const valid = {
    account_id: validUUID,
    instrument_id: validUUID2,
    trade_date: '2024-01-15',
    contracts: 2,
    side: 'long' as const,
    result: 250,
  };

  it('accepts valid trade data', () => {
    expect(createTradeSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults followed_plan to true', () => {
    const result = createTradeSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.followed_plan).toBe(true);
  });

  it('accepts negative result (losing trade)', () => {
    expect(createTradeSchema.safeParse({ ...valid, result: -300 }).success).toBe(true);
  });

  it('accepts zero result (breakeven trade)', () => {
    expect(createTradeSchema.safeParse({ ...valid, result: 0 }).success).toBe(true);
  });

  it('rejects invalid account_id UUID', () => {
    expect(createTradeSchema.safeParse({ ...valid, account_id: 'not-a-uuid' }).success).toBe(false);
  });

  it('rejects invalid instrument_id UUID', () => {
    expect(createTradeSchema.safeParse({ ...valid, instrument_id: 'bad' }).success).toBe(false);
  });

  it('rejects zero contracts', () => {
    expect(createTradeSchema.safeParse({ ...valid, contracts: 0 }).success).toBe(false);
  });

  it('rejects negative contracts', () => {
    expect(createTradeSchema.safeParse({ ...valid, contracts: -1 }).success).toBe(false);
  });

  it('rejects fractional contracts (must be integer)', () => {
    expect(createTradeSchema.safeParse({ ...valid, contracts: 1.5 }).success).toBe(false);
  });

  it('rejects invalid side value', () => {
    expect(createTradeSchema.safeParse({ ...valid, side: 'buy' }).success).toBe(false);
  });

  it('accepts side "short"', () => {
    expect(createTradeSchema.safeParse({ ...valid, side: 'short' }).success).toBe(true);
  });

  it('rejects invalid exit_reason', () => {
    expect(createTradeSchema.safeParse({ ...valid, exit_reason: 'expired' }).success).toBe(false);
  });

  it('accepts all valid exit reasons', () => {
    const reasons = ['take_profit', 'stop_loss', 'break_even', 'manual', 'timeout'] as const;
    for (const exit_reason of reasons) {
      expect(createTradeSchema.safeParse({ ...valid, exit_reason }).success).toBe(true);
    }
  });

  it('rejects invalid date format', () => {
    expect(createTradeSchema.safeParse({ ...valid, trade_date: '15-01-2024' }).success).toBe(false);
  });

  it('rejects notes exceeding 2000 characters', () => {
    expect(createTradeSchema.safeParse({ ...valid, notes: 'x'.repeat(2001) }).success).toBe(false);
  });
});

// ── updateTradeSchema ───────────────────────────────────────────────────────

describe('updateTradeSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(updateTradeSchema.safeParse({}).success).toBe(true);
  });

  it('accepts partial update with only result', () => {
    expect(updateTradeSchema.safeParse({ result: -150 }).success).toBe(true);
  });

  it('accepts partial update with only followed_plan', () => {
    expect(updateTradeSchema.safeParse({ followed_plan: false }).success).toBe(true);
  });

  it('accepts partial update with only emotions array', () => {
    expect(updateTradeSchema.safeParse({ emotions: ['disciplinado'] }).success).toBe(true);
  });

  it('accepts null exit_reason (clearing it)', () => {
    expect(updateTradeSchema.safeParse({ exit_reason: null }).success).toBe(true);
  });

  it('accepts null notes (clearing them)', () => {
    expect(updateTradeSchema.safeParse({ notes: null }).success).toBe(true);
  });

  it('rejects notes exceeding 2000 characters', () => {
    expect(updateTradeSchema.safeParse({ notes: 'x'.repeat(2001) }).success).toBe(false);
  });

  it('rejects fractional contracts', () => {
    expect(updateTradeSchema.safeParse({ contracts: 1.5 }).success).toBe(false);
  });
});
