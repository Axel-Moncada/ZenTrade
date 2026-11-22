'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRange, DateRangePreset } from '@/types/dashboard';
import { Calendar } from 'lucide-react';
import { useTr } from "@/lib/i18n/use-tr";

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** Si true, muestra solo el icono como trigger (para mobile compact bar) */
  compact?: boolean;
}

export function DateRangeSelector({ value, onChange, compact = false }: DateRangeSelectorProps) {
  const { tr } = useTr();
  const [preset, setPreset] = useState<DateRangePreset>('30d');
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handlePresetChange = (newPreset: DateRangePreset) => {
    setPreset(newPreset);

    if (newPreset === 'custom') {
      setShowCustom(true);
      return;
    }

    setShowCustom(false);
    const range = getDateRangeFromPreset(newPreset);
    onChange(range);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange({
        startDate: customStart,
        endDate: customEnd,
        label: tr('Personalizado', 'Custom')
      });
    }
  };

  if (compact) {
    return (
      <Select value={preset} onValueChange={(v) => handlePresetChange(v as DateRangePreset)}>
        <SelectTrigger className="w-9 h-9 p-0 justify-center rounded-lg border-zen-caribbean-green/40 bg-transparent [&>svg:last-child]:hidden">
          <Calendar className="h-4 w-4 text-zen-caribbean-green" />
        </SelectTrigger>
        <SelectContent className="text-zen-caribbean-green bg-zen-dark-green border-zen-dark-green">
          <SelectItem value="7d" className="hover:bg-zen-rich-black">{tr("Últimos 7 días", "Last 7 days")}</SelectItem>
          <SelectItem value="30d" className="hover:bg-zen-rich-black">{tr("Últimos 30 días", "Last 30 days")}</SelectItem>
          <SelectItem value="90d" className="hover:bg-zen-rich-black">{tr("Últimos 90 días", "Last 90 days")}</SelectItem>
          <SelectItem value="thisMonth" className="hover:bg-zen-rich-black">{tr("Este mes", "This month")}</SelectItem>
          <SelectItem value="custom" className="hover:bg-zen-rich-black">{tr("Personalizado", "Custom")}</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Calendar className="h-5 w-5 hover:bg-zen-rich-black" />

      <Select value={preset} onValueChange={(v) => handlePresetChange(v as DateRangePreset)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={tr("Seleccionar periodo", "Select period")} />
        </SelectTrigger>
        <SelectContent className="text-zen-caribbean-green bg-zen-dark-green border-zen-dark-green">
          <SelectItem value="7d" className="hover:bg-zen-rich-black">{tr("Últimos 7 días", "Last 7 days")}</SelectItem>
          <SelectItem value="30d" className="hover:bg-zen-rich-black">{tr("Últimos 30 días", "Last 30 days")}</SelectItem>
          <SelectItem value="90d" className="hover:bg-zen-rich-black">{tr("Últimos 90 días", "Last 90 days")}</SelectItem>
          <SelectItem value="thisMonth" className="hover:bg-zen-rich-black">{tr("Este mes", "This month")}</SelectItem>
          <SelectItem value="custom" className="hover:bg-zen-rich-black">{tr("Personalizado", "Custom")}</SelectItem>
        </SelectContent>
      </Select>

      {showCustom && (
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="start-date" className="text-xs">{tr("Desde", "From")}</Label>
            <Input
              id="start-date"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="end-date" className="text-xs">{tr("Hasta", "To")}</Label>
            <Input
              id="end-date"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <Button
            onClick={handleCustomApply}
            disabled={!customStart || !customEnd}
            className="mt-5"
          >
            {tr("Aplicar", "Apply")}
          </Button>
        </div>
      )}

      <span className="text-sm text-zen-anti-flash/70">
        {value.label}
      </span>
    </div>
  );
}

function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const today = new Date();
  const endDate = formatDateToISO(today);
  let startDate: string;
  let label: string;

  switch (preset) {
    case '7d':
      startDate = formatDateToISO(subtractDays(today, 7));
      label = 'Últimos 7 días';
      break;
    case '30d':
      startDate = formatDateToISO(subtractDays(today, 30));
      label = 'Últimos 30 días';
      break;
    case '90d':
      startDate = formatDateToISO(subtractDays(today, 90));
      label = 'Últimos 90 días';
      break;
    case 'thisMonth':
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = formatDateToISO(firstDay);
      label = 'Este mes';
      break;
    default:
      startDate = endDate;
      label = 'Hoy';
  }

  return { startDate, endDate, label };
}

function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}
