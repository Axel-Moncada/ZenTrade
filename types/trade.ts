export interface Trade {
  id: string
  user_id: string
  account_id: string
  instrument_id: string
  trade_date: string
  side: 'long' | 'short'
  contracts: number
  result: number | null
  exit_reason: string | null
  followed_plan: boolean
  emotions: string[] | null
  notes: string | null
  screenshot_url: string | null
  created_at: string
  updated_at: string
  instrument?: {
    id: string
    symbol: string
    name: string
    tick_size: number
    tick_value: number
  }
}

export interface CreateTradeInput {
  account_id: string
  instrument_id: string
  trade_date: string
  side: 'long' | 'short'
  contracts: number
  result?: number
  exit_reason?: string
  followed_plan: boolean
  emotions?: string[]
  notes?: string
  screenshot_url?: string
}
