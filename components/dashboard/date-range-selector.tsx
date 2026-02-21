'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRange, DateRangePreset } from '@/types/dashboard';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
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
        label: 'Personalizado'
      });
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Calendar className="h-5 w-5 text-gray-500" />
      
      <Select value={preset} onValueChange={(v) => handlePresetChange(v as DateRangePreset)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Seleccionar periodo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Últimos 7 días</SelectItem>
          <SelectItem value="30d">Últimos 30 días</SelectItem>
          <SelectItem value="90d">Últimos 90 días</SelectItem>
          <SelectItem value="thisMonth">Este mes</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {showCustom && (
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="start-date" className="text-xs">Desde</Label>
            <Input
              id="start-date"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="end-date" className="text-xs">Hasta</Label>
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
            Aplicar
          </Button>
        </div>
      )}

      <span className="text-sm text-gray-500">
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
