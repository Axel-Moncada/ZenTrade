'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trade } from '@/types/trade'
import { Account } from '@/types/accounts'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  Camera,
  TrendingUp,
  TrendingDown,
  Filter,
  Image as ImageIcon,
  Clock,
  StickyNote,
  Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BacktestingGalleryProps {
  trades: Trade[]
  accounts: Account[]
}

type ResultFilter = 'all' | 'winners' | 'losers'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPnl(value: number | null): string {
  if (value === null) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}$${Math.abs(value).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

// ─── Trade Card ───────────────────────────────────────────────────────────────

interface TradeCardProps {
  trade: Trade
  signedUrls: Record<string, string>
  onClick: () => void
  hideResult: boolean
}

function TradeCard({ trade, signedUrls, onClick, hideResult }: TradeCardProps) {
  const firstPath = trade.screenshot_urls?.[0] ?? null
  const signedUrl = firstPath ? signedUrls[firstPath] : null
  const isWinner = (trade.result ?? 0) >= 0
  const symbol = trade.instrument?.symbol ?? '—'

  return (
    <button
      onClick={onClick}
      className={`bt-card group relative rounded-xl overflow-hidden border transition-all duration-200 hover:scale-[1.02] hover:shadow-xl text-left w-full ${isWinner ? 'bt-card--winner' : 'bt-card--loser'}`}
    >
      {/* Imagen o placeholder */}
      <div className="relative h-36 overflow-hidden bt-card-image-bg">
        {signedUrl ? (
          <img
            src={signedUrl}
            alt={`Trade ${symbol}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-30">
            <Camera className="h-8 w-8 text-zen-anti-flash" />
            <span className="text-xs text-zen-anti-flash">Sin captura</span>
          </div>
        )}

        {/* Badge de cantidad de imágenes */}
        {(trade.screenshot_urls?.length ?? 0) > 1 && (
          <div className="absolute top-2 right-2 bt-img-badge rounded-full px-2 py-0.5 flex items-center gap-1">
            <ImageIcon className="h-3 w-3 text-white" />
            <span className="text-xs text-white font-medium">{trade.screenshot_urls!.length}</span>
          </div>
        )}

        {/* Overlay ocultar resultado */}
        {hideResult && (
          <div className="absolute inset-0 flex items-center justify-center bt-hide-overlay">
            <EyeOff className="h-6 w-6 text-white/60" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zen-anti-flash">{symbol}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${trade.side === 'long' ? 'bt-badge-long' : 'bt-badge-short'}`}>
              {trade.side === 'long' ? 'LONG' : 'SHORT'}
            </span>
          </div>
          {isWinner ? (
            <TrendingUp className="h-4 w-4 text-emerald-500 opacity-60" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 opacity-60" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-zen-anti-flash/40">{formatDate(trade.trade_date)}</span>
          {hideResult ? (
            <span className="text-sm font-bold bt-pnl-hidden">+$000.00</span>
          ) : (
            <span className={`text-sm font-bold ${isWinner ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatPnl(trade.result)}
            </span>
          )}
        </div>

        {trade.contracts > 0 && (
          <p className="text-xs text-zen-anti-flash/30">{trade.contracts} contrato{trade.contracts !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Borde izquierdo de color */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isWinner ? 'bg-emerald-500' : 'bg-red-500'} opacity-60`} />
    </button>
  )
}

// ─── Review Modal ─────────────────────────────────────────────────────────────

interface ReviewModalProps {
  trade: Trade
  trades: Trade[]
  currentIndex: number
  signedUrls: Record<string, string>
  hideResult: boolean
  onToggleHideResult: () => void
  onNavigate: (idx: number) => void
  onClose: () => void
}

function ReviewModal({
  trade,
  trades,
  currentIndex,
  signedUrls,
  hideResult,
  onToggleHideResult,
  onNavigate,
  onClose,
}: ReviewModalProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const isWinner = (trade.result ?? 0) >= 0
  const symbol = trade.instrument?.symbol ?? '—'
  const screenshots = trade.screenshot_urls ?? []
  const currentImage = screenshots[imageIndex] ? signedUrls[screenshots[imageIndex]] : null

  useEffect(() => {
    setImageIndex(0)
  }, [trade.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && currentIndex < trades.length - 1) onNavigate(currentIndex + 1)
      if (e.key === 'Escape') onClose()
      if (e.key === 'h' || e.key === 'H') onToggleHideResult()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIndex, trades.length, onNavigate, onClose, onToggleHideResult])

  const exitReasonLabel: Record<string, string> = {
    take_profit: 'Take Profit',
    stop_loss: 'Stop Loss',
    break_even: 'Break Even',
    manual: 'Manual',
    timeout: 'Timeout',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bt-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative flex w-full max-w-6xl mx-4 rounded-2xl overflow-hidden shadow-2xl bt-modal" style={{ maxHeight: '90vh' }}>
        {/* Panel izquierdo — imagen */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar superior */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zen-forest/20">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zen-anti-flash/40">
                {currentIndex + 1} / {trades.length}
              </span>
              {screenshots.length > 1 && (
                <div className="flex gap-1 ml-3">
                  {screenshots.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className="w-2 h-2 rounded-full transition-colors bt-dot"
                      data-active={i === imageIndex ? 'true' : 'false'}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleHideResult}
                className={`h-8 gap-2 text-xs bt-hide-btn ${hideResult ? 'bt-hide-btn--active' : ''}`}
              >
                {hideResult ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {hideResult ? 'Resultado oculto' : 'Ocultar resultado'}
                <span className="opacity-40 text-xs">H</span>
              </Button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4 text-zen-anti-flash/60" />
              </button>
            </div>
          </div>

          {/* Imagen principal */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden bt-modal-image-area" style={{ minHeight: 0 }}>
            {currentImage ? (
              <img
                src={currentImage}
                alt={`Captura ${imageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: 'calc(90vh - 130px)' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 opacity-25 p-12">
                <Camera className="h-16 w-16 text-zen-anti-flash" />
                <p className="text-zen-anti-flash text-sm">Sin capturas de pantalla</p>
              </div>
            )}

            {imageIndex > 0 && (
              <button
                onClick={() => setImageIndex(imageIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bt-img-nav transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
            )}
            {imageIndex < screenshots.length - 1 && (
              <button
                onClick={() => setImageIndex(imageIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bt-img-nav transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            )}
          </div>

          {/* Navegación entre trades */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-zen-forest/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="gap-2 text-zen-anti-flash/60 hover:text-zen-anti-flash disabled:opacity-20"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
              <span className="opacity-40 text-xs">←</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={currentIndex === trades.length - 1}
              className="gap-2 text-zen-anti-flash/60 hover:text-zen-anti-flash disabled:opacity-20"
            >
              Siguiente
              <span className="opacity-40 text-xs">→</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Panel derecho — stats */}
        <div className="w-72 flex-shrink-0 flex flex-col border-l border-zen-forest/20 overflow-y-auto bt-modal-stats">
          {/* Instrumento + resultado */}
          <div className="p-5 border-b border-zen-forest/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-zen-anti-flash">{symbol}</span>
              <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${trade.side === 'long' ? 'bt-badge-long' : 'bt-badge-short'}`}>
                {trade.side === 'long' ? '↑ LONG' : '↓ SHORT'}
              </span>
            </div>

            {/* PNL */}
            <div className={`rounded-xl p-3 text-center bt-pnl-box ${isWinner ? 'bt-pnl-box--win' : 'bt-pnl-box--loss'} ${hideResult ? 'bt-pnl-blurred' : ''}`}>
              <p className="text-xs text-zen-anti-flash/40 mb-1">Resultado</p>
              <p className={`text-2xl font-bold ${isWinner ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatPnl(trade.result)}
              </p>
              {trade.exit_reason && (
                <p className={`text-xs mt-1 opacity-60 ${isWinner ? 'text-emerald-500' : 'text-red-500'}`}>
                  {exitReasonLabel[trade.exit_reason] ?? trade.exit_reason}
                </p>
              )}
            </div>
          </div>

          {/* Detalles */}
          <div className="p-5 space-y-3 flex-1">
            <StatRow label="Fecha" value={formatDate(trade.trade_date)} />
            <StatRow label="Contratos" value={String(trade.contracts)} />
            {trade.entry_time && <StatRow label="Entrada" value={trade.entry_time} icon={<Clock className="h-3.5 w-3.5" />} />}
            {trade.exit_time && <StatRow label="Salida" value={trade.exit_time} icon={<Clock className="h-3.5 w-3.5" />} />}
            <StatRow
              label="Siguió el plan"
              value={trade.followed_plan ? 'Sí' : 'No'}
              valueColor={trade.followed_plan ? 'text-emerald-500' : 'text-red-500'}
            />

            {trade.emotions && trade.emotions.length > 0 && (
              <div>
                <p className="text-xs text-zen-anti-flash/40 mb-1.5 flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  Emociones
                </p>
                <div className="flex flex-wrap gap-1">
                  {trade.emotions.map((e) => (
                    <span key={e} className="text-xs px-2 py-0.5 rounded-full bt-emotion-tag">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {trade.notes && (
              <div>
                <p className="text-xs text-zen-anti-flash/40 mb-1.5 flex items-center gap-1">
                  <StickyNote className="h-3.5 w-3.5" />
                  Notas
                </p>
                <p className="text-xs text-zen-anti-flash/70 leading-relaxed rounded-lg p-2.5 bt-notes-box">
                  {trade.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatRow({
  label,
  value,
  valueColor,
  icon,
}: {
  label: string
  value: string
  valueColor?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zen-anti-flash/40 flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className={`text-xs font-medium text-zen-anti-flash ${valueColor ?? ''}`}>
        {value}
      </span>
    </div>
  )
}

// ─── Main Gallery Component ───────────────────────────────────────────────────

export function BacktestingGallery({ trades, accounts }: BacktestingGalleryProps) {
  const supabase = createClient()

  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)
  const [hideResult, setHideResult] = useState(false)

  const [resultFilter, setResultFilter] = useState<ResultFilter>('all')
  const [instrumentFilter, setInstrumentFilter] = useState<string>('all')
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [onlyWithScreenshots, setOnlyWithScreenshots] = useState(false)

  const instruments = Array.from(
    new Map(
      trades
        .filter((t) => t.instrument)
        .map((t) => [t.instrument!.symbol, t.instrument!])
    ).values()
  )

  const filtered = trades.filter((t) => {
    if (resultFilter === 'winners' && (t.result ?? 0) < 0) return false
    if (resultFilter === 'losers' && (t.result ?? 0) >= 0) return false
    if (instrumentFilter !== 'all' && t.instrument?.symbol !== instrumentFilter) return false
    if (accountFilter !== 'all' && t.account_id !== accountFilter) return false
    if (onlyWithScreenshots && !(t.screenshot_urls?.length)) return false
    return true
  })

  useEffect(() => {
    const paths = filtered
      .flatMap((t) => t.screenshot_urls ?? [])
      .filter((p) => !signedUrls[p])

    if (paths.length === 0) return

    const generate = async () => {
      const newMap: Record<string, string> = {}
      await Promise.all(
        paths.map(async (path) => {
          const { data } = await supabase.storage
            .from('trade-screenshots')
            .createSignedUrl(path, 3600)
          if (data?.signedUrl) newMap[path] = data.signedUrl
        })
      )
      if (Object.keys(newMap).length > 0) {
        setSignedUrls((prev) => ({ ...prev, ...newMap }))
      }
    }

    generate()
  }, [filtered.length, trades])

  const filterBtnClass = (active: boolean) =>
    `px-3 py-1.5 text-xs rounded-lg font-medium transition-colors bt-filter-btn ${active ? 'bt-filter-btn--active' : ''}`

  if (trades.length === 0) {
    return (
      <div className="text-center py-24 text-zen-anti-flash/30">
        <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Aún no tienes trades registrados.</p>
        <p className="text-xs mt-1">Registra tu primer trade para verlo aquí.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Barra de filtros */}
      <div className="bt-filter-bar rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-zen-anti-flash/40" />
          <span className="text-xs text-zen-anti-flash/40 font-medium">Filtros</span>
        </div>

        <div className="flex gap-1.5">
          {(['all', 'winners', 'losers'] as ResultFilter[]).map((f) => (
            <button key={f} onClick={() => setResultFilter(f)} className={filterBtnClass(resultFilter === f)}>
              {f === 'all' ? 'Todos' : f === 'winners' ? '✓ Ganadores' : '✗ Perdedores'}
            </button>
          ))}
        </div>

        {instruments.length > 1 && (
          <select
            value={instrumentFilter}
            onChange={(e) => setInstrumentFilter(e.target.value)}
            className="bt-select text-xs rounded-lg px-3 py-1.5 font-medium border transition-colors outline-none cursor-pointer"
          >
            <option value="all">Todos los instrumentos</option>
            {instruments.map((i) => (
              <option key={i.symbol} value={i.symbol}>{i.symbol}</option>
            ))}
          </select>
        )}

        {accounts.length > 1 && (
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="bt-select text-xs rounded-lg px-3 py-1.5 font-medium border transition-colors outline-none cursor-pointer"
          >
            <option value="all">Todas las cuentas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        )}

        <button
          onClick={() => setOnlyWithScreenshots((p) => !p)}
          className={filterBtnClass(onlyWithScreenshots)}
        >
          <Camera className="h-3 w-3 inline mr-1" />
          Solo con capturas
        </button>

        <span className="ml-auto text-xs text-zen-anti-flash/30">
          {filtered.length} trade{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zen-anti-flash/30">
          <p className="text-sm">No hay trades que coincidan con los filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((trade, idx) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              signedUrls={signedUrls}
              onClick={() => setReviewIndex(idx)}
              hideResult={hideResult}
            />
          ))}
        </div>
      )}

      {reviewIndex !== null && filtered[reviewIndex] && (
        <ReviewModal
          trade={filtered[reviewIndex]}
          trades={filtered}
          currentIndex={reviewIndex}
          signedUrls={signedUrls}
          hideResult={hideResult}
          onToggleHideResult={() => setHideResult((p) => !p)}
          onNavigate={setReviewIndex}
          onClose={() => setReviewIndex(null)}
        />
      )}
    </div>
  )
}
