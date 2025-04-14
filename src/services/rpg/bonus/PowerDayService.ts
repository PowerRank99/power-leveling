
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling Power Day functionality
 */
export class PowerDayService {
  // Power Day cap (can exceed 300 XP up to 500 XP)
  static readonly POWER_DAY_CAP = 500;
  
  /**
   * Check if a user has Power Day available
   */
  static async checkPowerDayAvailability(userId: string): Promise<{
    available: boolean;
    used: number;
    max: number;
    week: number;
    year: number;
  }> {
    if (!userId) {
      return { available: false, used: 0, max: 2, week: 0, year: 0 };
    }

    try {
      // Get current week and year
      const now = new Date();
      const week = this.getWeekNumber(now);
      const year = now.getFullYear();
      
      // Check current usage
      const { data, error } = await supabase
        .rpc('get_power_day_usage', { p_user_id: userId, p_week_number: week, p_year: year });
      
      if (error) {
        console.error('Error checking power day availability:', error);
        return { available: false, used: 0, max: 2, week: week, year: year };
      }
      
      const usedCount = data?.[0]?.count || 0;
      const available = usedCount < 2;
      
      return {
        available,
        used: usedCount,
        max: 2,
        week,
        year
      };
    } catch (error) {
      console.error('Error in checkPowerDayAvailability:', error);
      return { available: false, used: 0, max: 2, week: 0, year: 0 };
    }
  }

  /**
   * Record Power Day usage for a user
   */
  static async recordPowerDayUsage(
    userId: string,
    week: number,
    year: number
  ): Promise<boolean> {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .rpc('create_power_day_usage', {
          p_user_id: userId,
          p_week_number: week,
          p_year: year
        });

      if (error) {
        console.error('Error recording power day usage:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in recordPowerDayUsage:', error);
      return false;
    }
  }

  /**
   * Get the ISO week number for a date
   */
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
