// Tipos para especificaciones de instrumentos de futuros

export interface InstrumentSpec {
  id: string;
  symbol: string;
  name: string;
  tick_size: number;
  tick_value: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export type InstrumentCategory = 
  | 'indices' 
  | 'energy' 
  | 'metals' 
  | 'agriculture' 
  | 'currencies' 
  | 'bonds';
