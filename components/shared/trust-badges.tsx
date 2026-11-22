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

function PayPalBadge({ height = 28 }: { height?: number }) {
  return (
    <Image
      src="/assets/paypal-badge.webp"
      alt="PayPal"
      width={Math.round((height * 212) / 76)}
      height={height}
      className="rounded-md"
    />
  );
}

interface TrustBadgesProps {
  className?: string;
  locale?: 'es' | 'en';
}

export function TrustBadges({ className = '', locale = 'es' }: TrustBadgesProps) {
  const copy = {
    es: {
      guarantee: 'Reembolso en 7 días',
      guaranteeSub: 'Solicítalo por email',
      payment: 'Pago seguro',
      paymentSub: 'Procesado por PayPal',
      compatible: 'Hecho para las reglas de',
      disclaimer: 'Marcas de sus respectivos dueños. Zentrade no está afiliado ni respaldado por estas empresas.',
    },
    en: {
      guarantee: '7-day refund window',
      guaranteeSub: 'Request it by email',
      payment: 'Secure payment',
      paymentSub: 'Powered by PayPal',
      compatible: 'Built for the rules of',
      disclaimer: 'Trademarks belong to their owners. Zentrade is not affiliated with or endorsed by these firms.',
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
        <Image
          src="/assets/prop-firm-logos.webp"
          alt="FTMO, Apex Trader Funding, Topstep, Tradoverse and Uprofit"
          width={992}
          height={88}
          className="h-auto w-[300px] sm:w-[400px]"
        />
        <p className="max-w-[400px] text-center text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {copy.disclaimer}
        </p>
      </div>
    </div>
  );
}

export function TrustBadgesCompact({ className = '', locale = 'es' }: TrustBadgesProps) {
  const copy = {
    es: { guarantee: 'Reembolso en 7 días', compatible: 'Hecho para' },
    en: { guarantee: '7-day refund window', compatible: 'Built for' },
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
        <PayPalBadge height={20} />
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
