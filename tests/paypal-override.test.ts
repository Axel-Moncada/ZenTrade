import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/admin', () => ({ supabaseAdmin: {} }));
vi.mock('@/lib/paypal/client', () => ({ cancelSubscription: vi.fn(), getSubscription: vi.fn() }));

import { parseCustomId, resolvePlanWithOverride } from '@/lib/paypal/activate-subscription';

describe('resolvePlanWithOverride', () => {
  it('no baja de plan a un cliente con upgrade manual (caso Walter: ZenMode regalado, paga Pro)', () => {
    expect(resolvePlanWithOverride({ plan_key: 'zenmode', variant_id: 'manual_override' }, 'pro'))
      .toEqual({ plan: 'zenmode', keepVariant: true });
  });
  it('sí sube de plan si el cliente compra uno mayor que el manual', () => {
    expect(resolvePlanWithOverride({ plan_key: 'pro', variant_id: 'manual_override' }, 'zenmode'))
      .toEqual({ plan: 'zenmode', keepVariant: false });
  });
  it('sin upgrade manual, manda lo que diga PayPal', () => {
    expect(resolvePlanWithOverride({ plan_key: 'zenmode', variant_id: 'paypal-zenmode-monthly' }, 'starter'))
      .toEqual({ plan: 'starter', keepVariant: false });
    expect(resolvePlanWithOverride(null, 'pro')).toEqual({ plan: 'pro', keepVariant: false });
  });
});

describe('parseCustomId', () => {
  it('valida el formato userId|plan|interval', () => {
    expect(parseCustomId('u1|pro|monthly')).toEqual({ userId: 'u1', plan: 'pro', interval: 'monthly' });
    expect(parseCustomId('u1|gold|monthly')).toBeNull();
    expect(parseCustomId(undefined)).toBeNull();
  });
});
