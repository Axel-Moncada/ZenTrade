'use client';

import { useState, useEffect } from 'react';
import { TradeWithInstrument } from '@/types/trades';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Pencil, TrendingUp, TrendingDown, Target, AlertCircle, Minus, Clock, CheckCircle, XCircle, Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { ScreenshotLightbox } from './screenshot-lightbox';

const EMOTIONS_CONFIG: Record<string, { label: string; color: string }> = {
  disciplinado: { label: 'Disciplinado', color: 'bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40' },
  confiado: { label: 'Confiado', color: 'bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40' },
  paciente: { label: 'Paciente', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40' },
  ansioso: { label: 'Ansioso', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40' },
  miedo: { label: 'Miedo', color: 'bg-zen-danger/20 text-zen-danger border-zen-danger/40' },
  codicia: { label: 'Codicia', color: 'bg-zen-danger/20 text-zen-danger border-zen-danger/40' },
  frustrado: { label: 'Frustrado', color: 'bg-zen-danger/15 text-zen-danger border-zen-danger/30' },
  'eufórico': { label: 'Eufórico', color: 'bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40' },
  revenge_trading: { label: 'Revenge Trading', color: 'bg-zen-danger/25 text-zen-danger border-zen-danger/50' },
  fomo: { label: 'FOMO', color: 'bg-zen-danger/20 text-zen-danger border-zen-danger/40' },
};

interface TradeCardProps {
  trade: TradeWithInstrument;
  onEdit?: (trade: TradeWithInstrument) => void;
  onDelete?: (tradeId: string) => void;
}

const exitReasonIcons = {
  take_profit: <Target className="h-3 w-3" />,
  stop_loss: <AlertCircle className="h-3 w-3" />,
  break_even: <Minus className="h-3 w-3" />,
  manual: <Clock className="h-3 w-3" />,
  timeout: <Clock className="h-3 w-3" />,
};

const exitReasonLabels = {
  take_profit: 'Take Profit',
  stop_loss: 'Stop Loss',
  break_even: 'Break Even',
  manual: 'Manual',
  timeout: 'Timeout',
};

const exitReasonColors = {
  take_profit: 'bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40',
  stop_loss: 'bg-zen-danger/20 text-zen-danger border-zen-danger/40',
  break_even: 'bg-zen-forest/20 text-zen-forest border-zen-forest/40',
  manual: 'bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40',
  timeout: 'bg-zen-pistachio/20 text-zen-pistachio border-zen-pistachio/40',
};

export function TradeCard({ trade, onEdit, onDelete }: TradeCardProps) {
  const isWinner = trade.result > 0;
  const isLoser = trade.result < 0;

  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const paths = trade.screenshot_urls;
    if (!paths || paths.length === 0) return;

    const supabase = createClient();
    setLoadingUrls(true);

    Promise.all(
      paths.map(async (path) => {
        const { data } = await supabase.storage
          .from("trade-screenshots")
          .createSignedUrl(path, 3600);
        return data?.signedUrl ?? null;
      })
    ).then((results) => {
      setSignedUrls(results.filter((u): u is string => u !== null));
      setLoadingUrls(false);
    });
  }, [trade.screenshot_urls]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className={cn(
      "relative rounded-lg p-4 border transition-all",
      isWinner ? "bg-zen-caribbean-green/5 border-zen-caribbean-green/40 hover:bg-zen-caribbean-green/10" :
      isLoser ? "bg-zen-danger/5 border-zen-danger/40 hover:bg-zen-danger/10" :
      "bg-zen-surface/60 border-zen-forest/40 hover:bg-zen-surface/80"
    )}>
      {/* Header: Instrumento y PNL */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-zen-anti-flash">{trade.instrument.symbol}</span>
          <Badge className={cn(
            "text-xs px-2 py-0.5 border",
            trade.side === 'long'
              ? "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40"
              : "bg-zen-danger/20 text-zen-danger border-zen-danger/40"
          )}>
            {trade.side === 'long' ? (
              <><TrendingUp className="h-3 w-3 mr-1" /> LONG</>
            ) : (
              <><TrendingDown className="h-3 w-3 mr-1" /> SHORT</>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xl font-bold",
            isWinner ? "text-zen-caribbean-green" : isLoser ? "text-zen-danger" : "text-zen-anti-flash/70"
          )}>
            {trade.result >= 0 ? '+' : ''}${trade.result.toFixed(2)}
          </span>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                onClick={() => onEdit(trade)}
                className="h-7 w-7 p-0 bg-zen-caribbean-green/20 hover:bg-zen-caribbean-green/30 text-zen-caribbean-green rounded-md transition-colors"
                title="Editar trade"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(trade.id)}
                className="h-7 w-7 p-0 bg-zen-danger/20 hover:bg-zen-danger/30 text-zen-danger rounded-md transition-colors"
                title="Eliminar trade"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info principal: Contratos y Razón */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-zen-anti-flash/60">Contratos:</span>
          <span className="font-medium text-zen-anti-flash">{trade.contracts}</span>
        </div>

        {trade.exit_reason && (
          <Badge
            className={cn("text-xs flex items-center gap-1 px-2 py-0.5 border", exitReasonColors[trade.exit_reason])}
          >
            {exitReasonIcons[trade.exit_reason]}
            {exitReasonLabels[trade.exit_reason]}
          </Badge>
        )}
      </div>

      {/* Etiquetas de Trading Plan y Emociones */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Trading Plan */}
        <Badge
          className={cn(
            "text-xs flex items-center gap-1 px-2 py-0.5 border",
            trade.followed_plan
              ? "bg-zen-caribbean-green/20 text-zen-caribbean-green border-zen-caribbean-green/40"
              : "bg-zen-danger/20 text-zen-danger border-zen-danger/40"
          )}
        >
          {trade.followed_plan ? (
            <><CheckCircle className="h-3 w-3" /> Plan</>
          ) : (
            <><XCircle className="h-3 w-3" /> Sin Plan</>
          )}
        </Badge>

        {/* Emociones */}
        {trade.emotions && trade.emotions.length > 0 && (
          <>
            {trade.emotions.map((emotion, index) => {
              const config = EMOTIONS_CONFIG[emotion] || { label: emotion, color: 'bg-zen-forest/20 text-zen-forest border-zen-forest/40' };
              return (
                <Badge
                  key={index}
                  className={cn("text-xs px-2 py-0.5 border", config.color)}
                >
                  {config.label}
                </Badge>
              );
            })}
          </>
        )}
      </div>

      {/* Notas (si existen) */}
      {trade.notes && (
        <div className="pt-3 border-t border-zen-forest/30">
          <p className="text-xs text-zen-anti-flash/60 mb-1">Notas:</p>
          <p className="text-sm text-zen-anti-flash/80">{trade.notes}</p>
        </div>
      )}

      {/* Screenshots */}
      {trade.screenshot_urls && trade.screenshot_urls.length > 0 && (
        <div className={cn("pt-3", trade.notes ? "mt-0" : "border-t border-zen-forest/30")}>
          <div className="flex items-center gap-1.5 mb-2">
            <Camera className="h-3 w-3 text-zen-caribbean-green/60" />
            <span className="text-xs text-zen-anti-flash/50">
              {trade.screenshot_urls.length} captura{trade.screenshot_urls.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {loadingUrls
              ? Array.from({ length: trade.screenshot_urls.length }).map((_, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-lg bg-zen-surface/60 border border-zen-forest/30 flex items-center justify-center"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-zen-caribbean-green/60" />
                  </div>
                ))
              : signedUrls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => openLightbox(i)}
                    className="w-16 h-16 rounded-lg overflow-hidden border border-zen-forest/40 hover:border-zen-caribbean-green/60 bg-zen-surface/60 group transition-all"
                    title={`Ver captura ${i + 1}`}
                  >
                    <img
                      src={url}
                      alt={`Captura ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </button>
                ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {signedUrls.length > 0 && (
        <ScreenshotLightbox
          urls={signedUrls}
          currentIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}
    </div>
  );
}
