
import { supabase } from '@/integrations/supabase/client';

export class XPService {
  // Daily XP cap for regular workouts
  static readonly DAILY_XP_CAP = 300;
  
  // Base XP values
  static readonly PR_BONUS_XP = 50;
  static readonly BASE_EXERCISE_XP = 10;
  static readonly BASE_SET_XP = 2;
  
  // Manual workout XP values
  static readonly MANUAL_WORKOUT_BASE_XP = 50;
  static readonly POWER_DAY_BONUS_XP = 50;
  
  /**
   * Add XP to a user's profile
   */
  static async addXP(
    userId: string, 
    amount: number, 
    source: string
  ): Promise<boolean> {
    try {
      // Call RPC function to add XP (assumes this function exists in the database)
      const { error } = await supabase.rpc('add_xp_to_user', {
        p_user_id: userId,
        p_xp_amount: amount,
        p_xp_source: source
      });
      
      if (error) {
        console.error('Error adding XP:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Exception in addXP:', error);
      return false;
    }
  }
}
