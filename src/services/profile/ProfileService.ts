
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for managing user profiles
 */
export class ProfileService {
  /**
   * Update profile statistics after workout completion
   */
  public static async updateProfileStats(
    userId: string, 
    durationSeconds: number, 
    exerciseCount: number, 
    setCount: number
  ): Promise<boolean> {
    try {
      if (!userId) {
        console.error('Invalid user ID provided');
        return false;
      }
      
      // Update profile with workout stats
      const { error } = await supabase.rpc('increment_profile_counter', { 
        user_id_param: userId, 
        counter_name: 'workouts_count', 
        increment_amount: 1 
      });

      if (error) {
        console.error('Error updating profile stats:', error);
        return false;
      }

      // Update last workout timestamp
      const { error: timestampError } = await supabase
        .from('profiles')
        .update({
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (timestampError) {
        console.error('Error updating last workout timestamp:', timestampError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateProfileStats:', error);
      return false;
    }
  }
}
