'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { X, CalendarIcon, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TradesFiltersProps {
  instruments: Array<{ id: string; symbol: string; name: string }>
  onFiltersChange: (filters: TradeFilters) => void
  activeFiltersCount: number
}

export interface TradeFilters {
  instrument?: string
  side?: 'long' | 'short'
  exitReason?: string
  followedPlan?: boolean
  emotion?: string
  winnersOnly?: boolean
  losersOnly?: boolean
  startDate?: Date
  endDate?: Date
}

const EXIT_REASONS = [
  { value: 'take_profit', label: 'Take Profit' },
  { value: 'stop_loss', label: 'Stop Loss' },
  { value: 'break_even', label: 'Break Even' },
  { value: 'manual', label: 'Manual' },
  { value: 'timeout', label: 'Timeout' },
]

const EMOTIONS = [
  { value: 'disciplinado', label: 'Disciplinado' },
  { value: 'confiado', label: 'Confiado' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'ansioso', label: 'Ansioso' },
  { value: 'miedo', label: 'Miedo' },
  { value: 'fomo', label: 'FOMO' },
  { value: 'venganza', label: 'Venganza' },
  { value: 'euforia', label: 'Euforia' },
  { value: 'frustrado', label: 'Frustrado' },
  { value: 'aburrido', label: 'Aburrido' },
]

export function TradesFilters({ instruments, onFiltersChange, activeFiltersCount }: TradesFiltersProps) {
  const [filters, setFilters] = useState<TradeFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = (key: keyof TradeFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  const removeFilter = (key: keyof TradeFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className="space-y-4">
      {/* Header con botón toggle */}
      <div className="flex items-center justify-between ">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black"
        >
          <Filter className="h-4 w-4 " />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-zen-anti-flash">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button className='bg-zen-caribbean-green text-zen-rich-black' variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Active filters badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 text-zen-anti-flash">
          {filters.instrument && (
            <Badge variant="secondary" className="gap-1">
              Instrumento: {instruments.find(i => i.id === filters.instrument)?.symbol}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('instrument')}
              />
            </Badge>
          )}
          {filters.side && (
            <Badge variant="secondary" className="gap-1">
              Lado: {filters.side === 'long' ? 'Largo' : 'Corto'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('side')}
              />
            </Badge>
          )}
          {filters.exitReason && (
            <Badge variant="secondary" className="gap-1">
              Salida: {EXIT_REASONS.find(e => e.value === filters.exitReason)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('exitReason')}
              />
            </Badge>
          )}
          {filters.followedPlan !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Plan: {filters.followedPlan ? 'Seguido' : 'No seguido'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('followedPlan')}
              />
            </Badge>
          )}
          {filters.emotion && (
            <Badge variant="secondary" className="gap-1">
              Emoción: {EMOTIONS.find(e => e.value === filters.emotion)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('emotion')}
              />
            </Badge>
          )}
          {filters.winnersOnly && (
            <Badge variant="secondary" className="gap-1">
              Solo ganadores
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('winnersOnly')}
              />
            </Badge>
          )}
          {filters.losersOnly && (
            <Badge variant="secondary" className="gap-1">
              Solo perdedores
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('losersOnly')}
              />
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="secondary" className="gap-1">
              Desde: {format(filters.startDate, 'dd/MM/yyyy')}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('startDate')}
              />
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="secondary" className="gap-1">
              Hasta: {format(filters.endDate, 'dd/MM/yyyy')}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('endDate')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-zen-caribbean-green rounded-lg bg-zen-dark-green text-zen-anti-flash">
          {/* Dates */}
          <div className="space-y-2">
            <Label className="text-zen-anti-flash">Fecha inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal border-zen-caribbean-green bg-zen-dark-green text-zen-anti-flash hover:bg-zen-rich-black hover:text-zen-anti-flash',
                    !filters.startDate && 'text-zen-caribbean-green/60'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, 'PPP', { locale: es }) : 'Seleccionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 shadow-lg bg-zen-dark-green border border-zen-caribbean-green">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => updateFilter('startDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-zen-anti-flash">Fecha fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal border-zen-caribbean-green bg-zen-dark-green text-zen-anti-flash hover:bg-zen-rich-black hover:text-zen-anti-flash',
                    !filters.endDate && 'text-zen-caribbean-green/60'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, 'PPP', { locale: es }) : 'Seleccionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 shadow-lg bg-zen-dark-green border border-zen-caribbean-green">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => updateFilter('endDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Instrument */}
          <div className="space-y-2">
            <Label className="text-zen-anti-flash">Instrumento</Label>
            <Select
              value={filters.instrument || 'all'}
              onValueChange={(value) => updateFilter('instrument', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
                <SelectItem value="all" className="hover:bg-zen-rich-black">Todos</SelectItem>
                {instruments.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id} className="hover:bg-zen-rich-black">
                    {inst.symbol} - {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Side */}
          <div className="space-y-2">
            <Label className="text-zen-anti-flash">Lado</Label>
            <Select
              value={filters.side || 'all'}
              onValueChange={(value) => updateFilter('side', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
                <SelectItem value="all" className="hover:bg-zen-rich-black">Todos</SelectItem>
                <SelectItem value="long" className="hover:bg-zen-rich-black">Largo</SelectItem>
                <SelectItem value="short" className="hover:bg-zen-rich-black">Corto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Exit Reason */}
          <div className="space-y-2">
            <Label className="text-zen-anti-flash">Razón de salida</Label>
            <Select
              value={filters.exitReason || 'all'}
              onValueChange={(value) => updateFilter('exitReason', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
                <SelectItem value="all" className="hover:bg-zen-rich-black">Todas</SelectItem>
                {EXIT_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value} className="hover:bg-zen-rich-black">
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Followed Plan */}
          <div className="space-y-2">
            <Label className="text-zen-anti-flash">Siguió el plan</Label>
            <Select
              value={filters.followedPlan === undefined ? 'all' : filters.followedPlan.toString()}
              onValueChange={(value) =>
                updateFilter('followedPlan', value === 'all' ? undefined : value === 'true')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
                <SelectItem value="all" className="hover:bg-zen-rich-black">Todos</SelectItem>
                <SelectItem value="true" className="hover:bg-zen-rich-black">Sí</SelectItem>
                <SelectItem value="false" className="hover:bg-zen-rich-black">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Emotion */}
          <div className="space-y-2">
            <Label className="text-zen-anti-flash">Emoción</Label>
            <Select
              value={filters.emotion || 'all'}
              onValueChange={(value) => updateFilter('emotion', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
                <SelectItem value="all" className="hover:bg-zen-rich-black">Todas</SelectItem>
                {EMOTIONS.map((emotion) => (
                  <SelectItem key={emotion.value} value={emotion.value} className="hover:bg-zen-rich-black">
                    {emotion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Winners/Losers */}
          <div className="space-y-2">
            <Label className="text-zen-anti-flash">Resultado</Label>
            <Select
              value={
                filters.winnersOnly ? 'winners' :
                filters.losersOnly ? 'losers' :
                'all'
              }
              onValueChange={(value) => {
                if (value === 'winners') {
                  updateFilter('winnersOnly', true)
                  updateFilter('losersOnly', false)
                } else if (value === 'losers') {
                  updateFilter('losersOnly', true)
                  updateFilter('winnersOnly', false)
                } else {
                  updateFilter('winnersOnly', false)
                  updateFilter('losersOnly', false)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="text-zen-caribbean-green bg-zen-dark-green">
                <SelectItem value="all" className="hover:bg-zen-rich-black">Todos</SelectItem>
                <SelectItem value="winners" className="hover:bg-zen-rich-black">Solo ganadores</SelectItem>
                <SelectItem value="losers" className="hover:bg-zen-rich-black">Solo perdedores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
