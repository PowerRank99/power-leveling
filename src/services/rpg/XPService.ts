
import { supabase } from '@/integrations/supabase/client';
import { XPService as RPGXPService } from '@/services/rpg/XPService';

/**
 * XP Service for awarding experience points to users
 * 
 * This is a lightweight wrapper around the more complex RPGXPService
 * to maintain backward compatibility
 */
export class XPService {
  // Daily XP cap for regular workouts
  static readonly DAILY_XP_CAP = RPGXPService.DAILY_XP_CAP;
  
  // Base XP values
  static readonly PR_BONUS_XP = RPGXPService.PR_BONUS_XP;
  static readonly BASE_EXERCISE_XP = RPGXPService.BASE_EXERCISE_XP;
  static readonly BASE_SET_XP = RPGXPService.BASE_SET_XP;
  
  // Manual workout XP values
  static readonly MANUAL_WORKOUT_BASE_XP = 100; // Updated to 100
  static readonly POWER_DAY_BONUS_XP = 50;
  
  /**
   * Add XP to a user's profile
   * Uses the awardXP method from the RPGXPService for implementation
   * 
   * @param userId - The ID of the user to award XP to
   * @param amount - The amount of XP to award
   * @param source - The source of the XP (e.g., 'workout', 'achievement')
   * @param metadata - Optional metadata about the XP award (for logging/debugging)
   */
  static async addXP(
    userId: string, 
    amount: number, 
    source: string = 'workout',
    metadata?: any
  ): Promise<boolean> {
    try {
      // Use the existing RPGXPService to award XP
      return await RPGXPService.awardXP(userId, amount, source, metadata);
    } catch (error) {
      console.error('Exception in addXP:', error);
      return false;
    }
  }
}
