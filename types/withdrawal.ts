export interface Withdrawal {
  id: string
  user_id: string
  account_id: string
  amount: number
  withdrawal_date: string
  status: 'pending' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface WithdrawalWithAccount extends Withdrawal {
  account: {
    name: string
    broker: string
    currency: string
  }
}
