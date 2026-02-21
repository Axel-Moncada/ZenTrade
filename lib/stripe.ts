import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const PLAN_PRICE_IDS = {
  starter: {
    month: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!,
    year:  process.env.STRIPE_STARTER_ANNUAL_PRICE_ID!,
  },
  professional: {
    month: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    year:  process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  },
  zenmode: {
    month: process.env.STRIPE_ZENMODE_MONTHLY_PRICE_ID ?? '',
    year:  process.env.STRIPE_ZENMODE_ANNUAL_PRICE_ID  ?? '',
  },
} as const;

export type PlanSlug = keyof typeof PLAN_PRICE_IDS;
