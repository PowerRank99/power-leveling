
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResult } from '@/types/workoutTypes';
import { createSuccessResult, createErrorResult, createVoidSuccessResult } from '@/utils/serviceUtils';

/**
 * Service for managing exercise-specific rest timers
 */
export class TimerService {
  /**
   * Get the rest timer duration for a specific exercise
   */
  static async getExerciseTimerDuration(
    userId: string,
    exerciseId: string
  ): Promise<DatabaseResult<number>> {
    try {
      console.log(`[TimerService] Getting timer duration for exercise=${exerciseId}, user=${userId}`);
      
      // We need to use the raw fetch method since the exercise_timers table
      // might not be in the TypeScript types yet
      const { data, error } = await supabase
        .from('exercise_timers')
        .select('duration_seconds')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .single();
        
      if (error) {
        // If no record exists, this is not an error - just means we should use default
        if (error.code === 'PGRST116') {
          console.log(`[TimerService] No timer found for exercise=${exerciseId}, will use default`);
          return await this.getDefaultTimerDuration(userId);
        }
        
        console.error("[TimerService] Error fetching timer:", error);
        return createErrorResult(error);
      }
      
      console.log(`[TimerService] Found timer duration: ${data.duration_seconds} seconds`);
      return createSuccessResult(data.duration_seconds);
    } catch (error) {
      console.error("[TimerService] Exception fetching timer:", error);
      return createErrorResult(error);
    }
  }
  
  /**
   * Get the user's default timer duration
   */
  static async getDefaultTimerDuration(
    userId: string
  ): Promise<DatabaseResult<number>> {
    try {
      console.log(`[TimerService] Getting default timer duration for user=${userId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('default_rest_timer_seconds')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("[TimerService] Error fetching default timer:", error);
        return createErrorResult(error);
      }
      
      if (data && typeof data.default_rest_timer_seconds === 'number') {
        console.log(`[TimerService] Default timer duration: ${data.default_rest_timer_seconds} seconds`);
        return createSuccessResult(data.default_rest_timer_seconds);
      } else {
        return createSuccessResult(90); // Default fallback if somehow not in DB
      }
    } catch (error) {
      console.error("[TimerService] Exception fetching default timer:", error);
      return createErrorResult(error);
    }
  }
  
  /**
   * Save a timer duration for a specific exercise
   */
  static async saveExerciseTimerDuration(
    userId: string,
    exerciseId: string,
    durationSeconds: number
  ): Promise<DatabaseResult<void>> {
    try {
      console.log(`[TimerService] Saving timer for exercise=${exerciseId}, duration=${durationSeconds}s`);
      
      // We need to use the raw fetch method since the exercise_timers table
      // might not be in the TypeScript types yet
      const { error } = await supabase
        .from('exercise_timers')
        .upsert({
          user_id: userId,
          exercise_id: exerciseId,
          duration_seconds: durationSeconds,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,exercise_id'
        });
        
      if (error) {
        console.error("[TimerService] Error saving timer:", error);
        return createErrorResult(error);
      }
      
      console.log(`[TimerService] Timer saved successfully`);
      return createVoidSuccessResult();
    } catch (error) {
      console.error("[TimerService] Exception saving timer:", error);
      return createErrorResult(error);
    }
  }
  
  /**
   * Save the user's default timer duration
   */
  static async saveDefaultTimerDuration(
    userId: string,
    durationSeconds: number
  ): Promise<DatabaseResult<void>> {
    try {
      console.log(`[TimerService] Saving default timer duration=${durationSeconds}s for user=${userId}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ default_rest_timer_seconds: durationSeconds })
        .eq('id', userId);
        
      if (error) {
        console.error("[TimerService] Error saving default timer:", error);
        return createErrorResult(error);
      }
      
      console.log(`[TimerService] Default timer saved successfully`);
      return createVoidSuccessResult();
    } catch (error) {
      console.error("[TimerService] Exception saving default timer:", error);
      return createErrorResult(error);
    }
  }
  
  /**
   * Get all timer settings for a user
   */
  static async getUserTimerSettings(userId: string): Promise<DatabaseResult<{
    timer_sound_enabled: boolean;
    timer_vibration_enabled: boolean;
    timer_notification_enabled: boolean;
    default_rest_timer_seconds: number;
  }>> {
    try {
      console.log(`[TimerService] Getting timer settings for user=${userId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          timer_sound_enabled,
          timer_vibration_enabled,
          timer_notification_enabled,
          default_rest_timer_seconds
        `)
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("[TimerService] Error fetching timer settings:", error);
        return createErrorResult(error);
      }
      
      // Ensure we have default values if any field is missing
      const settings = {
        timer_sound_enabled: data?.timer_sound_enabled ?? true,
        timer_vibration_enabled: data?.timer_vibration_enabled ?? true,
        timer_notification_enabled: data?.timer_notification_enabled ?? true,
        default_rest_timer_seconds: data?.default_rest_timer_seconds ?? 90
      };
      
      return createSuccessResult(settings);
    } catch (error) {
      console.error("[TimerService] Exception fetching timer settings:", error);
      return createErrorResult(error);
    }
  }
  
  /**
   * Save user timer settings
   */
  static async saveUserTimerSettings(
    userId: string,
    settings: {
      timer_sound_enabled?: boolean;
      timer_vibration_enabled?: boolean;
      timer_notification_enabled?: boolean;
      default_rest_timer_seconds?: number;
    }
  ): Promise<DatabaseResult<void>> {
    try {
      console.log(`[TimerService] Saving timer settings for user=${userId}`, settings);
      
      const { error } = await supabase
        .from('profiles')
        .update(settings)
        .eq('id', userId);
        
      if (error) {
        console.error("[TimerService] Error saving timer settings:", error);
        return createErrorResult(error);
      }
      
      console.log(`[TimerService] Timer settings saved successfully`);
      return createVoidSuccessResult();
    } catch (error) {
      console.error("[TimerService] Exception saving timer settings:", error);
      return createErrorResult(error);
    }
  }
}
