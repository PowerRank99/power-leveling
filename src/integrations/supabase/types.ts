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
          category: string
          created_at: string
          description: string | null
          equipment: string | null
          equipment_type: string | null
          id: string
          image_url: string | null
          level: string
          muscle_group: string | null
          name: string
          type: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          equipment?: string | null
          equipment_type?: string | null
          id?: string
          image_url?: string | null
          level: string
          muscle_group?: string | null
          name: string
          type: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          equipment?: string | null
          equipment_type?: string | null
          id?: string
          image_url?: string | null
          level?: string
          muscle_group?: string | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements_count: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          default_rest_timer_seconds: number
          id: string
          level: number | null
          name: string | null
          records_count: number | null
          timer_notification_enabled: boolean
          timer_sound_enabled: boolean
          timer_vibration_enabled: boolean
          title: string | null
          updated_at: string | null
          workouts_count: number | null
          xp: number | null
        }
        Insert: {
          achievements_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          default_rest_timer_seconds?: number
          id: string
          level?: number | null
          name?: string | null
          records_count?: number | null
          timer_notification_enabled?: boolean
          timer_sound_enabled?: boolean
          timer_vibration_enabled?: boolean
          title?: string | null
          updated_at?: string | null
          workouts_count?: number | null
          xp?: number | null
        }
        Update: {
          achievements_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          default_rest_timer_seconds?: number
          id?: string
          level?: number | null
          name?: string | null
          records_count?: number | null
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
      migrate_exercise_history: {
        Args: Record<PropertyKey, never>
        Returns: number
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
