export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievement_progress: {
        Row: {
          achievement_id: string | null
          current_value: number | null
          id: string
          is_complete: boolean | null
          target_value: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          current_value?: number | null
          id?: string
          is_complete?: boolean | null
          target_value: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          current_value?: number | null
          id?: string
          is_complete?: boolean | null
          target_value?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievement_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          category: string
          category_type: string | null
          description: string
          icon_name: string
          id: string
          name: string
          points: number
          rank: string
          rank_requirements: Json | null
          requirement_type: string | null
          requirements: Json
          string_id: string
          xp_reward: number
        }
        Insert: {
          category: string
          category_type?: string | null
          description: string
          icon_name: string
          id?: string
          name: string
          points?: number
          rank?: string
          rank_requirements?: Json | null
          requirement_type?: string | null
          requirements: Json
          string_id: string
          xp_reward: number
        }
        Update: {
          category?: string
          category_type?: string | null
          description?: string
          icon_name?: string
          id?: string
          name?: string
          points?: number
          rank?: string
          rank_requirements?: Json | null
          requirement_type?: string | null
          requirements?: Json
          string_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      class_bonuses: {
        Row: {
          bonus_type: string
          bonus_value: number
          class_name: string
          description: string
          id: string
        }
        Insert: {
          bonus_type: string
          bonus_value: number
          class_name: string
          description: string
          id?: string
        }
        Update: {
          bonus_type?: string
          bonus_value?: number
          class_name?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      competition_participants: {
        Row: {
          competition_id: string | null
          id: string
          joined_at: string | null
          participant_id: string | null
          participant_type: string
          score: number | null
        }
        Insert: {
          competition_id?: string | null
          id?: string
          joined_at?: string | null
          participant_id?: string | null
          participant_type: string
          score?: number | null
        }
        Update: {
          competition_id?: string | null
          id?: string
          joined_at?: string | null
          participant_id?: string | null
          participant_type?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_participants_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          name: string
          rules: Json | null
          start_date: string
          status: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          rules?: Json | null
          start_date: string
          status?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          rules?: Json | null
          start_date?: string
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_history: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          last_used_at: string
          reps: number
          sets: number
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          last_used_at?: string
          reps?: number
          sets?: number
          user_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          last_used_at?: string
          reps?: number
          sets?: number
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercise_history_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_timers: {
        Row: {
          created_at: string
          duration_seconds: number
          exercise_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          exercise_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          exercise_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_timers_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          description: string | null
          equipment_type: string | null
          id: string
          image_url: string | null
          level: string
          muscle_group: string | null
          name: string
          training_type: string | null
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          equipment_type?: string | null
          id?: string
          image_url?: string | null
          level: string
          muscle_group?: string | null
          name: string
          training_type?: string | null
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          equipment_type?: string | null
          id?: string
          image_url?: string | null
          level?: string
          muscle_group?: string | null
          name?: string
          training_type?: string | null
          type?: string
        }
        Relationships: []
      }
      guild_members: {
        Row: {
          guild_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          guild_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          guild_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_raid_participants: {
        Row: {
          completed: boolean | null
          days_completed: number | null
          id: string
          raid_id: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          days_completed?: number | null
          id?: string
          raid_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          days_completed?: number | null
          id?: string
          raid_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_raid_participants_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "guild_raids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_raid_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_raids: {
        Row: {
          created_at: string | null
          created_by: string | null
          days_required: number
          end_date: string
          guild_id: string | null
          id: string
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          days_required: number
          end_date: string
          guild_id?: string | null
          id?: string
          name: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          days_required?: number
          end_date?: string
          guild_id?: string | null
          id?: string
          name?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_raids_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_raids_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "guilds_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_workouts: {
        Row: {
          activity_type: string | null
          created_at: string
          description: string | null
          exercise_id: string | null
          id: string
          is_power_day: boolean
          photo_url: string
          user_id: string
          workout_date: string
          xp_awarded: number
        }
        Insert: {
          activity_type?: string | null
          created_at?: string
          description?: string | null
          exercise_id?: string | null
          id?: string
          is_power_day?: boolean
          photo_url: string
          user_id: string
          workout_date?: string
          xp_awarded?: number
        }
        Update: {
          activity_type?: string | null
          created_at?: string
          description?: string | null
          exercise_id?: string | null
          id?: string
          is_power_day?: boolean
          photo_url?: string
          user_id?: string
          workout_date?: string
          xp_awarded?: number
        }
        Relationships: []
      }
      passive_skill_usage: {
        Row: {
          id: string
          skill_name: string
          used_at: string
          user_id: string
        }
        Insert: {
          id?: string
          skill_name: string
          used_at?: string
          user_id: string
        }
        Update: {
          id?: string
          skill_name?: string
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          exercise_id: string
          id: string
          previous_weight: number
          recorded_at: string
          user_id: string
          weight: number
        }
        Insert: {
          exercise_id: string
          id?: string
          previous_weight?: number
          recorded_at?: string
          user_id: string
          weight?: number
        }
        Update: {
          exercise_id?: string
          id?: string
          previous_weight?: number
          recorded_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      power_day_usage: {
        Row: {
          created_at: string
          id: string
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievement_points: number | null
          achievements_count: number | null
          avatar_url: string | null
          bio: string | null
          class: string | null
          class_selected_at: string | null
          created_at: string | null
          daily_xp: number | null
          daily_xp_cap: number | null
          default_rest_timer_seconds: number
          equipped_items: Json | null
          id: string
          last_workout_at: string | null
          level: number | null
          name: string | null
          rank: string | null
          rank_progress: Json | null
          records_count: number | null
          streak: number | null
          timer_notification_enabled: boolean
          timer_sound_enabled: boolean
          timer_vibration_enabled: boolean
          title: string | null
          updated_at: string | null
          workouts_count: number | null
          xp: number | null
        }
        Insert: {
          achievement_points?: number | null
          achievements_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          class?: string | null
          class_selected_at?: string | null
          created_at?: string | null
          daily_xp?: number | null
          daily_xp_cap?: number | null
          default_rest_timer_seconds?: number
          equipped_items?: Json | null
          id: string
          last_workout_at?: string | null
          level?: number | null
          name?: string | null
          rank?: string | null
          rank_progress?: Json | null
          records_count?: number | null
          streak?: number | null
          timer_notification_enabled?: boolean
          timer_sound_enabled?: boolean
          timer_vibration_enabled?: boolean
          title?: string | null
          updated_at?: string | null
          workouts_count?: number | null
          xp?: number | null
        }
        Update: {
          achievement_points?: number | null
          achievements_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          class?: string | null
          class_selected_at?: string | null
          created_at?: string | null
          daily_xp?: number | null
          daily_xp_cap?: number | null
          default_rest_timer_seconds?: number
          equipped_items?: Json | null
          id?: string
          last_workout_at?: string | null
          level?: number | null
          name?: string | null
          rank?: string | null
          rank_progress?: Json | null
          records_count?: number | null
          streak?: number | null
          timer_notification_enabled?: boolean
          timer_sound_enabled?: boolean
          timer_vibration_enabled?: boolean
          title?: string | null
          updated_at?: string | null
          workouts_count?: number | null
          xp?: number | null
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          display_order: number
          exercise_id: string
          id: string
          routine_id: string
          target_reps: string
          target_sets: number
        }
        Insert: {
          display_order: number
          exercise_id: string
          id?: string
          routine_id: string
          target_reps?: string
          target_sets?: number
        }
        Update: {
          display_order?: number
          exercise_id?: string
          id?: string
          routine_id?: string
          target_reps?: string
          target_sets?: number
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          id: string
          last_used_at: string | null
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achieved_at: string | null
          achievement_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          achieved_at?: string | null
          achievement_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          achieved_at?: string | null
          achievement_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          exercise_id: string | null
          id: string
          reps: number | null
          set_order: number
          weight: number | null
          workout_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          exercise_id?: string | null
          id?: string
          reps?: number | null
          set_order: number
          weight?: number | null
          workout_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          exercise_id?: string | null
          id?: string
          reps?: number | null
          set_order?: number
          weight?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_varieties: {
        Row: {
          completed_at: string | null
          exercise_types: string[] | null
          id: string
          user_id: string
          workout_date: string
        }
        Insert: {
          completed_at?: string | null
          exercise_types?: string[] | null
          id?: string
          user_id: string
          workout_date: string
        }
        Update: {
          completed_at?: string | null
          exercise_types?: string[] | null
          id?: string
          user_id?: string
          workout_date?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          completed_at: string | null
          duration_seconds: number | null
          id: string
          rest_timer_minutes: number | null
          rest_timer_seconds: number | null
          routine_id: string | null
          started_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          duration_seconds?: number | null
          id?: string
          rest_timer_minutes?: number | null
          rest_timer_seconds?: number | null
          routine_id?: string | null
          started_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          duration_seconds?: number | null
          id?: string
          rest_timer_minutes?: number | null
          rest_timer_seconds?: number | null
          routine_id?: string | null
          started_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      backfill_manual_workouts_to_varieties: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      batch_update_achievement_progress: {
        Args: { p_user_id: string; p_achievements: Json }
        Returns: {
          achievement_id: string | null
          current_value: number | null
          id: string
          is_complete: boolean | null
          target_value: number
          updated_at: string | null
          user_id: string | null
        }[]
      }
      begin_transaction: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_rank_score: {
        Args: { p_level: number; p_achievement_points: number }
        Returns: Json
      }
      check_achievement_batch: {
        Args: { p_user_id: string; p_achievement_ids: string[] }
        Returns: {
          achievement_id: string
          awarded: boolean
        }[]
      }
      check_personal_record_cooldown: {
        Args: { p_user_id: string; p_exercise_id: string; p_days?: number }
        Returns: boolean
      }
      check_recent_manual_workouts: {
        Args: { p_user_id: string; p_hours: number }
        Returns: {
          count: number
        }[]
      }
      commit_transaction: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_achievement_id_migration: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_manual_workout: {
        Args: {
          p_user_id: string
          p_description: string
          p_activity_type: string
          p_exercise_id: string
          p_photo_url: string
          p_xp_awarded: number
          p_workout_date: string
          p_is_power_day: boolean
        }
        Returns: boolean
      }
      create_power_day_usage: {
        Args: { p_user_id: string; p_week_number: number; p_year: number }
        Returns: boolean
      }
      debug_fix_combo_fitness_achievement: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_achievement_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_all_achievement_progress: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_class_bonuses: {
        Args: { p_class_name: string }
        Returns: Json
      }
      get_class_cooldown: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_paginated_workouts: {
        Args: { p_user_id: string; p_limit: number; p_cursor?: string }
        Returns: {
          id: string
          started_at: string
          completed_at: string
          duration_seconds: number
          routine_id: string
          exercise_count: number
          next_cursor: string
        }[]
      }
      get_personal_records_for_workout: {
        Args: { p_workout_id: string; p_user_id: string }
        Returns: {
          exercise_id: string
          current_record: number
          previous_record: number
        }[]
      }
      get_power_day_usage: {
        Args: { p_user_id: string; p_week_number: number; p_year: number }
        Returns: {
          count: number
        }[]
      }
      get_user_manual_workouts: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          description: string
          activity_type: string
          exercise_id: string
          photo_url: string
          xp_awarded: number
          created_at: string
          workout_date: string
          is_power_day: boolean
        }[]
      }
      get_user_profile_dashboard: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_workout_with_sets: {
        Args: { p_workout_id: string }
        Returns: {
          workout_id: string
          workout_started_at: string
          workout_completed_at: string
          workout_duration_seconds: number
          routine_id: string
          user_id: string
          set_id: string
          exercise_id: string
          set_order: number
          weight: number
          reps: number
          completed: boolean
          completed_at: string
        }[]
      }
      handle_manual_workout_completion: {
        Args: { p_user_id: string; p_workout_date: string }
        Returns: undefined
      }
      handle_manual_workout_completion_with_xp: {
        Args: {
          p_user_id: string
          p_workout_date: string
          p_xp_amount: number
          p_xp_source: string
        }
        Returns: undefined
      }
      increment_profile_counter: {
        Args: {
          user_id_param: string
          counter_name: string
          increment_amount: number
        }
        Returns: undefined
      }
      insert_personal_record: {
        Args: {
          p_user_id: string
          p_exercise_id: string
          p_weight: number
          p_previous_weight: number
        }
        Returns: undefined
      }
      manage_workout_variety: {
        Args: {
          p_user_id: string
          p_workout_date: string
          p_activity_type: string
        }
        Returns: undefined
      }
      match_achievement_by_name: {
        Args: Record<PropertyKey, never>
        Returns: {
          string_id: string
          uuid: string
          name: string
          similarity: number
        }[]
      }
      migrate_exercise_columns: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      migrate_exercise_history: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      recalculate_user_levels: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      rollback_transaction: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      select_class: {
        Args: { p_user_id: string; p_class_name: string }
        Returns: Json
      }
      standardize_achievement_id: {
        Args: { input_text: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
