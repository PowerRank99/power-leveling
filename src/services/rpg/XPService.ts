
import { supabase } from '@/integrations/supabase/client';
import { XPToastService } from './bonus/XPToastService';
import { ServiceResponse } from '../common/ErrorHandlingService';

/**
 * XP Service for handling experience points operations
 */
export class XPService {
  // Constants
  static readonly DAILY_XP_CAP = 300;
  static readonly POWER_DAY_XP_CAP = 500;
  static readonly PR_BONUS_XP = 50;
  static readonly BASE_EXERCISE_XP = 5;
  static readonly BASE_SET_XP = 2;
  static readonly MANUAL_WORKOUT_BASE_XP = 100;
  
  /**
   * Award XP to a user
   * 
   * @param userId - The ID of the user to award XP to
   * @param amount - The amount of XP to award
   * @param source - The source of the XP (e.g., 'workout', 'achievement')
   * @param metadata - Optional metadata about the XP award
   */
  static async awardXP(
    userId: string, 
    amount: number, 
    source: string = 'workout',
    metadata?: any
  ): Promise<boolean> {
    try {
      console.log(`[XPService] Awarding ${amount} XP to user ${userId} from ${source}`);
      
      // Call the increment_xp RPC function
      const { data, error } = await supabase.rpc('increment_xp', {
        user_id: userId,
        amount: amount
      });
      
      if (error) {
        console.error('[XPService] Error awarding XP:', error);
        return false;
      }
      
      // Show toast notification - using the correct method name
      XPToastService.showXPToast(amount, undefined, false);
      
      return true;
    } catch (error) {
      console.error('[XPService] Exception in awardXP:', error);
      return false;
    }
  }
  
  /**
   * Award XP specifically for workout completion
   */
  static async awardWorkoutXP(
    userId: string,
    durationSeconds: number,
    metadata?: any
  ): Promise<boolean> {
    // Calculate XP amount based on duration (simplified)
    const amount = Math.min(durationSeconds / 60 * 10, this.DAILY_XP_CAP);
    return this.awardXP(userId, Math.round(amount), 'workout', metadata);
  }
  
  /**
   * Check for personal records and award XP if found
   */
  static async checkForPersonalRecords(
    userId: string,
    workoutId: string
  ): Promise<boolean> {
    try {
      // Call the check_personal_records RPC function
      const { data, error } = await supabase.rpc('check_personal_records', {
        p_user_id: userId,
        p_workout_id: workoutId
      });
      
      if (error) {
        console.error('[XPService] Error checking for personal records:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[XPService] Exception in checkForPersonalRecords:', error);
      return false;
    }
  }
  
  /**
   * Check if a power day is available for the user
   */
  static async checkPowerDayAvailability(
    userId: string
  ): Promise<{
    available: boolean;
    used: number;
    max: number;
    week: number;
    year: number;
  }> {
    const now = new Date();
    const currentWeek = this.getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    try {
      // Count power day usages for the current week
      const { data, error } = await supabase
        .from('power_day_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('week_number', currentWeek)
        .eq('year', currentYear);
      
      if (error) {
        console.error('[XPService] Error checking power day availability:', error);
        return {
          available: false,
          used: 0,
          max: 2,
          week: currentWeek,
          year: currentYear
        };
      }
      
      const usedCount = data?.length || 0;
      const maxUses = 2;
      
      return {
        available: usedCount < maxUses,
        used: usedCount,
        max: maxUses,
        week: currentWeek,
        year: currentYear
      };
    } catch (error) {
      console.error('[XPService] Exception in checkPowerDayAvailability:', error);
      return {
        available: false,
        used: 0,
        max: 2,
        week: currentWeek,
        year: currentYear
      };
    }
  }
  
  /**
   * Record power day usage for a user
   */
  static async recordPowerDayUsage(
    userId: string,
    week: number,
    year: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('power_day_usage')
        .insert({
          user_id: userId,
          week_number: week,
          year: year,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('[XPService] Error recording power day usage:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[XPService] Exception in recordPowerDayUsage:', error);
      return false;
    }
  }
  
  /**
   * Helper function to get the week number for a date
   */
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
