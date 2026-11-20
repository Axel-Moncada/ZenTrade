import { describe, expect, it } from 'vitest';
import { formatLoss, formatSignedMoney } from '@/lib/utils/format-money';

describe('formatSignedMoney', () => {
  it('muestra el signo menos en pérdidas', () => {
    expect(formatSignedMoney(-220)).toBe('-$220.00');
    expect(formatSignedMoney(-1050.5)).toBe('-$1,050.50');
  });
  it('muestra + en ganancias y nada en cero', () => {
    expect(formatSignedMoney(250)).toBe('+$250.00');
    expect(formatSignedMoney(0)).toBe('$0.00');
    expect(formatSignedMoney(-0.001)).toBe('$0.00');
  });
  it('respeta decimales y showPlus', () => {
    expect(formatSignedMoney(-36.67, { decimals: 0 })).toBe('-$37');
    expect(formatSignedMoney(520, { showPlus: false })).toBe('$520.00');
  });
  it('tolera null/undefined', () => {
    expect(formatSignedMoney(null)).toBe('$0.00');
  });
});

describe('formatLoss', () => {
  it('siempre con signo menos', () => {
    expect(formatLoss(-650)).toBe('-$650');
    expect(formatLoss(1050)).toBe('-$1,050');
    expect(formatLoss(0)).toBe('$0');
  });
});
