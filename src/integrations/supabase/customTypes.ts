
import { Database } from './types';

// Extend the Database type to include our custom tables
export type CustomDatabase = Database & {
  public: {
    Tables: {
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          xp_reward: number;
          icon_name: string;
          requirements: Record<string, any>;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: string;
          xp_reward: number;
          icon_name: string;
          requirements: Record<string, any>;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          xp_reward?: number;
          icon_name?: string;
          requirements?: Record<string, any>;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          achieved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          achieved_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          achieved_at?: string;
        };
      };
      class_bonuses: {
        Row: {
          id: string;
          class_name: string;
          bonus_type: string;
          bonus_value: number;
          description: string;
        };
        Insert: {
          id?: string;
          class_name: string;
          bonus_type: string;
          bonus_value: number;
          description: string;
        };
        Update: {
          id?: string;
          class_name?: string;
          bonus_type?: string;
          bonus_value?: number;
          description?: string;
        };
      };
      guilds: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          avatar_url: string | null;
          created_at: string;
          creator_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          creator_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          creator_id?: string | null;
        };
      };
      guild_members: {
        Row: {
          id: string;
          guild_id: string;
          user_id: string;
          joined_at: string;
          role: string;
        };
        Insert: {
          id?: string;
          guild_id: string;
          user_id: string;
          joined_at?: string;
          role?: string;
        };
        Update: {
          id?: string;
          guild_id?: string;
          user_id?: string;
          joined_at?: string;
          role?: string;
        };
      };
      competitions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string;
          type: string;
          status: 'pending' | 'active' | 'completed';
          rules: Record<string, any> | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          type: string;
          status?: 'pending' | 'active' | 'completed';
          rules?: Record<string, any> | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          type?: string;
          status?: 'pending' | 'active' | 'completed';
          rules?: Record<string, any> | null;
          created_by?: string;
          created_at?: string;
        };
      };
      competition_participants: {
        Row: {
          id: string;
          competition_id: string | null;
          participant_id: string | null;
          participant_type: string;
          score: number | null;
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          competition_id?: string | null;
          participant_id?: string | null;
          participant_type: string;
          score?: number | null;
          joined_at?: string | null;
        };
        Update: {
          id?: string;
          competition_id?: string | null;
          participant_id?: string | null;
          participant_type?: string;
          score?: number | null;
          joined_at?: string | null;
        };
      };
    } & Database['public']['Tables'];
    Views: Database['public']['Views'];
    Functions: {
      increment: {
        Args: { i: number };
        Returns: number;
      };
    } & Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
};

// Type-safe Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const customSupabase = createClient<CustomDatabase>(
  supabaseUrl,
  supabaseKey
);
