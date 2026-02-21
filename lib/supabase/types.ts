// Tipos de base de datos generados desde Supabase
// Por ahora tipos básicos, se regenerarán después de crear el esquema

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          timezone: string;
          currency: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          timezone?: string;
          currency?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          timezone?: string;
          currency?: string;
        };
      };
    };
  };
}
