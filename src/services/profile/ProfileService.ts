
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
      const { error } = await supabase
        .from('profiles')
        .update({
          workouts_count: supabase.rpc('increment_profile_counter', { 
            user_id_param: userId, 
            counter_name: 'workouts_count', 
            increment_amount: 1 
          }),
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating profile stats:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateProfileStats:', error);
      return false;
    }
  }
}
