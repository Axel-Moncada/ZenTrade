'use client';

import Image from 'next/image';
import { ShieldCheck, Lock } from 'lucide-react';

const PROP_FIRMS = [
  { name: 'FTMO',       color: '#FF6B00' },
  { name: 'Apex',       color: '#5B8DEF' },
  { name: 'TopStep',    color: '#00B86B' },
  { name: 'Tradoverse', color: '#7C6FCD' },
  { name: 'Uprofit',    color: '#3B82F6' },
];

function PayPalBadge() {
  return (
    <div
      className="flex items-center px-2 py-1 rounded-md"
      style={{ background: '#003087', border: '1px solid rgba(0,156,222,0.4)' }}
    >
      <Image
        src="/assets/paypallogo.png"
        alt="PayPal"
        width={64}
        height={18}
        className="object-contain"
      />
    </div>
  );
}

interface TrustBadgesProps {
  className?: string;
  locale?: 'es' | 'en';
}

export function TrustBadges({ className = '', locale = 'es' }: TrustBadgesProps) {
  const copy = {
    es: {
      guarantee: 'Garantía 15 días',
      guaranteeSub: 'Devolución sin preguntas',
      payment: 'Pago seguro',
      paymentSub: 'Procesado por PayPal',
      compatible: 'Compatible con',
    },
    en: {
      guarantee: '15-day guarantee',
      guaranteeSub: 'Refund, no questions asked',
      payment: 'Secure payment',
      paymentSub: 'Powered by PayPal',
      compatible: 'Works with',
    },
  }[locale];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-5 ${className}`}>
      {/* Guarantee */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(0,193,124,0.12)', border: '1px solid rgba(0,193,124,0.28)' }}
        >
          <ShieldCheck className="w-4 h-4 text-zen-caribbean-green" />
        </div>
        <div>
          <p className="text-xs font-semibold text-zen-anti-flash leading-tight">{copy.guarantee}</p>
          <p className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>{copy.guaranteeSub}</p>
        </div>
      </div>

      <div className="hidden md:block w-px h-7" style={{ background: 'rgba(255,255,255,0.07)' }} />

      {/* PayPal */}
      <div className="flex items-center gap-2.5">
        <PayPalBadge />
        <div>
          <p className="text-xs font-semibold text-zen-anti-flash leading-tight">{copy.payment}</p>
          <p className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>{copy.paymentSub}</p>
        </div>
      </div>

      <div className="hidden md:block w-px h-7" style={{ background: 'rgba(255,255,255,0.07)' }} />

      {/* Prop firms */}
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{copy.compatible}</p>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {PROP_FIRMS.map((firm) => (
            <span
              key={firm.name}
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{
                color: firm.color,
                background: `${firm.color}18`,
                border: `1px solid ${firm.color}35`,
              }}
            >
              {firm.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrustBadgesCompact({ className = '', locale = 'es' }: TrustBadgesProps) {
  const copy = {
    es: { guarantee: 'Garantía 15 días', compatible: 'Funciona con' },
    en: { guarantee: '15-day guarantee', compatible: 'Works with' },
  }[locale];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
      {/* Guarantee */}
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-zen-caribbean-green shrink-0" />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{copy.guarantee}</span>
      </div>

      <div className="w-px h-3.5" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* PayPal inline */}
      <div className="flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: '#009CDE' }} />
        <PayPalBadge />
      </div>

      <div className="w-px h-3.5" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Prop firms */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs mr-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{copy.compatible}:</span>
        {PROP_FIRMS.map((firm) => (
          <span
            key={firm.name}
            className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{ color: firm.color, background: `${firm.color}18`, border: `1px solid ${firm.color}30` }}
          >
            {firm.name}
          </span>
        ))}
      </div>
    </div>
  );
}
