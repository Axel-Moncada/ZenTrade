// Tipos para operaciones de trading

export type ExitReason = 'take_profit' | 'stop_loss' | 'break_even' | 'manual' | 'timeout';

export type Emotion = 
  | 'disciplinado'
  | 'confiado'
  | 'paciente'
  | 'ansioso'
  | 'miedo'
  | 'codicia'
  | 'frustrado'
  | 'eufórico'
  | 'revenge_trading'
  | 'fomo';

export interface Trade {
  id: string;
  user_id: string;
  account_id: string;
  instrument_id: string;
  trade_date: string;
  contracts: number;
  side: 'long' | 'short';
  result: number;
  exit_reason: ExitReason | null;
  followed_plan: boolean;
  emotions: string[] | null;
  notes: string | null;
  screenshot_url: string | null;
  entry_time: string | null;
  exit_time: string | null;
  screenshot_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TradeWithInstrument extends Trade {
  instrument: {
    symbol: string;
    name: string;
    tick_size: number;
    tick_value: number;
  };
}

export interface CreateTradeInput {
  account_id: string;
  instrument_id: string;
  trade_date: string;
  contracts: number;
  side: 'long' | 'short';
  result: number;
  exit_reason?: ExitReason;
  followed_plan?: boolean;
  emotions?: string[];
  notes?: string;
  screenshot_url?: string;
  entry_time?: string | null;
  exit_time?: string | null;
  screenshot_urls?: string[] | null;
}

export interface UpdateTradeInput {
  instrument_id?: string;
  trade_date?: string;
  contracts?: number;
  side?: 'long' | 'short';
  result?: number;
  exit_reason?: ExitReason;
  followed_plan?: boolean;
  emotions?: string[];
  notes?: string;
  screenshot_url?: string;
  entry_time?: string | null;
  exit_time?: string | null;
  screenshot_urls?: string[] | null;
}
