// Database Types - Generado desde Supabase Schema
// Representa la estructura de las tablas en Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          lemon_squeezy_subscription_id: string;
          lemon_squeezy_customer_id: string;
          variant_id: string;
          plan_key: "free" | "starter" | "pro" | "zenmode";
          billing_interval: "monthly" | "annual";
          status: "active" | "cancelled" | "expired" | "paused" | "past_due" | "unpaid" | "on_trial";
          current_period_end: string | null;
          customer_portal_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lemon_squeezy_subscription_id: string;
          lemon_squeezy_customer_id: string;
          variant_id: string;
          plan_key: "free" | "starter" | "pro" | "zenmode";
          billing_interval: "monthly" | "annual";
          status: "active" | "cancelled" | "expired" | "paused" | "past_due" | "unpaid" | "on_trial";
          current_period_end?: string | null;
          customer_portal_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lemon_squeezy_subscription_id?: string;
          lemon_squeezy_customer_id?: string;
          variant_id?: string;
          plan_key?: "free" | "starter" | "pro" | "zenmode";
          billing_interval?: "monthly" | "annual";
          status?: "active" | "cancelled" | "expired" | "paused" | "past_due" | "unpaid" | "on_trial";
          current_period_end?: string | null;
          customer_portal_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          timezone: string;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          timezone?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          timezone?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          account_type: "evaluation" | "live";
          broker: string | null;
          platform: string | null;
          initial_balance: number;
          starting_balance: number;
          current_balance: number;
          manual_adjustments: number | null;
          drawdown_type: "trailing" | "static";
          max_drawdown: number;
          profit_target: number | null;
          buffer_amount: number | null;
          start_date: string;
          status: "active" | "passed" | "failed" | "inactive";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          account_type: "evaluation" | "live";
          broker?: string | null;
          platform?: string | null;
          initial_balance: number;
          starting_balance: number;
          current_balance: number;
          manual_adjustments?: number | null;
          drawdown_type: "trailing" | "static";
          max_drawdown: number;
          profit_target?: number | null;
          buffer_amount?: number | null;
          start_date: string;
          status?: "active" | "passed" | "failed" | "inactive";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          account_type?: "evaluation" | "live";
          broker?: string | null;
          platform?: string | null;
          initial_balance?: number;
          starting_balance?: number;
          current_balance?: number;
          manual_adjustments?: number | null;
          drawdown_type?: "trailing" | "static";
          max_drawdown?: number;
          profit_target?: number | null;
          buffer_amount?: number | null;
          start_date?: string;
          status?: "active" | "passed" | "failed" | "inactive";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_summaries: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          summary_date: string;
          total_trades: number;
          winning_trades: number;
          losing_trades: number;
          gross_pnl: number;
          net_pnl: number;
          commissions: number;
          starting_balance: number | null;
          ending_balance: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          summary_date: string;
          total_trades?: number;
          winning_trades?: number;
          losing_trades?: number;
          gross_pnl?: number;
          net_pnl?: number;
          commissions?: number;
          starting_balance?: number | null;
          ending_balance?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          summary_date?: string;
          total_trades?: number;
          winning_trades?: number;
          losing_trades?: number;
          gross_pnl?: number;
          net_pnl?: number;
          commissions?: number;
          starting_balance?: number | null;
          ending_balance?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      instrument_specs: {
        Row: {
          id: string;
          symbol: string;
          name: string;
          tick_size: number;
          tick_value: number;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          name: string;
          tick_size: number;
          tick_value: number;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          name?: string;
          tick_size?: number;
          tick_value?: number;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          instrument_id: string;
          trade_date: string;
          contracts: number;
          side: 'long' | 'short';
          result: number;
          exit_reason: 'take_profit' | 'stop_loss' | 'break_even' | 'manual' | 'timeout' | null;
          followed_plan: boolean;
          emotions: string[] | null;
          notes: string | null;
          screenshot_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          instrument_id: string;
          trade_date: string;
          contracts: number;
          side: 'long' | 'short';
          result: number;
          exit_reason?: 'take_profit' | 'stop_loss' | 'break_even' | 'manual' | 'timeout' | null;
          followed_plan?: boolean;
          emotions?: string[] | null;
          notes?: string | null;
          screenshot_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          instrument_id?: string;
          trade_date?: string;
          contracts?: number;
          side?: 'long' | 'short';
          result?: number;
          exit_reason?: 'take_profit' | 'stop_loss' | 'break_even' | 'manual' | 'timeout' | null;
          followed_plan?: boolean;
          emotions?: string[] | null;
          notes?: string | null;
          screenshot_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
