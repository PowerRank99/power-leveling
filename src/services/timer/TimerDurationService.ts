
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResult } from '@/types/workoutTypes';

/**
 * Service responsible for managing exercise-specific and default timer durations
 */
export class TimerDurationService {
  /**
   * Get the rest timer duration for a specific exercise
   */
  static async getExerciseTimerDuration(
    userId: string,
    exerciseId: string
  ): Promise<DatabaseResult<number>> {
    try {
      console.log(`[TimerDurationService] Getting timer duration for exercise=${exerciseId}, user=${userId}`);
      
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
          console.log(`[TimerDurationService] No timer found for exercise=${exerciseId}, will use default`);
          return await this.getDefaultTimerDuration(userId);
        }
        
        console.error("[TimerDurationService] Error fetching timer:", error);
        return { success: false, error };
      }
      
      console.log(`[TimerDurationService] Found timer duration: ${data.duration_seconds} seconds`);
      return { success: true, data: data.duration_seconds };
    } catch (error) {
      console.error("[TimerDurationService] Exception fetching timer:", error);
      return { success: false, error };
    }
  }
  
  /**
   * Get the user's default timer duration
   */
  static async getDefaultTimerDuration(
    userId: string
  ): Promise<DatabaseResult<number>> {
    try {
      console.log(`[TimerDurationService] Getting default timer duration for user=${userId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('default_rest_timer_seconds')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("[TimerDurationService] Error fetching default timer:", error);
        return { success: false, error };
      }
      
      if (data && typeof data.default_rest_timer_seconds === 'number') {
        console.log(`[TimerDurationService] Default timer duration: ${data.default_rest_timer_seconds} seconds`);
        return { success: true, data: data.default_rest_timer_seconds };
      } else {
        return { success: true, data: 90 }; // Default fallback if somehow not in DB
      }
    } catch (error) {
      console.error("[TimerDurationService] Exception fetching default timer:", error);
      return { success: false, error: error };
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
      console.log(`[TimerDurationService] Saving timer for exercise=${exerciseId}, duration=${durationSeconds}s`);
      
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
        console.error("[TimerDurationService] Error saving timer:", error);
        return { success: false, error };
      }
      
      console.log(`[TimerDurationService] Timer saved successfully`);
      return { success: true };
    } catch (error) {
      console.error("[TimerDurationService] Exception saving timer:", error);
      return { success: false, error };
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
      console.log(`[TimerDurationService] Saving default timer duration=${durationSeconds}s for user=${userId}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ default_rest_timer_seconds: durationSeconds })
        .eq('id', userId);
        
      if (error) {
        console.error("[TimerDurationService] Error saving default timer:", error);
        return { success: false, error };
      }
      
      console.log(`[TimerDurationService] Default timer saved successfully`);
      return { success: true };
    } catch (error) {
      console.error("[TimerDurationService] Exception saving default timer:", error);
      return { success: false, error };
    }
  }
}
