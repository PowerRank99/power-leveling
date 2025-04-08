
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResult } from '@/types/workoutTypes';

/**
 * Service responsible for managing user timer settings
 */
export class TimerSettingsService {
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
      console.log(`[TimerSettingsService] Getting timer settings for user=${userId}`);
      
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
        console.error("[TimerSettingsService] Error fetching timer settings:", error);
        return { success: false, error };
      }
      
      // Ensure we have default values if any field is missing
      const settings = {
        timer_sound_enabled: data?.timer_sound_enabled ?? true,
        timer_vibration_enabled: data?.timer_vibration_enabled ?? true,
        timer_notification_enabled: data?.timer_notification_enabled ?? true,
        default_rest_timer_seconds: data?.default_rest_timer_seconds ?? 90
      };
      
      return { success: true, data: settings };
    } catch (error) {
      console.error("[TimerSettingsService] Exception fetching timer settings:", error);
      return { success: false, error };
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
      console.log(`[TimerSettingsService] Saving timer settings for user=${userId}`, settings);
      
      const { error } = await supabase
        .from('profiles')
        .update(settings)
        .eq('id', userId);
        
      if (error) {
        console.error("[TimerSettingsService] Error saving timer settings:", error);
        return { success: false, error };
      }
      
      console.log(`[TimerSettingsService] Timer settings saved successfully`);
      return { success: true };
    } catch (error) {
      console.error("[TimerSettingsService] Exception saving timer settings:", error);
      return { success: false, error };
    }
  }
}
