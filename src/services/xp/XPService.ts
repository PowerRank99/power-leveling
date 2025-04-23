
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
   */
  static async addXP(
    userId: string, 
    amount: number, 
    source: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      // Use the existing RPGXPService to award XP
      return await RPGXPService.awardXP(userId, amount);
    } catch (error) {
      console.error('Exception in addXP:', error);
      return false;
    }
  }
  
  /**
   * Legacy method for backward compatibility
   */
  static async awardXP(
    userId: string,
    amount: number,
    source?: string
  ): Promise<boolean> {
    return await this.addXP(userId, amount, source || 'legacy');
  }
}
