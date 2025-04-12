
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling Power Day functionality
 */
export class PowerDayService {
  static readonly POWER_DAY_CAP = 500;

  /**
   * Get the current ISO week number
   */
  static getCurrentWeek(): number {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    
    // Calculate current week number based on ISO week definition (weeks start on Monday)
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    
    return weekNum;
  }

  /**
   * Get power day usage for a user in a specific week
   */
  static async getPowerDayUsage(userId: string, week: number, year: number): Promise<{ count: number }> {
    try {
      const { data, error } = await supabase
        .from('power_day_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('week_number', week)
        .eq('year', year);
      
      if (error) {
        console.error('Error checking power day usage:', error);
        return { count: 0 };
      }
      
      return { count: data?.length || 0 };
    } catch (error) {
      console.error('Error checking power day usage:', error);
      return { count: 0 };
    }
  }

  /**
   * Check power day availability
   */
  static async checkPowerDayAvailability(userId: string): Promise<{ 
    available: boolean;
    used: number;
    max: number;
    week: number;
    year: number;
  }> {
    try {
      const currentWeek = this.getCurrentWeek();
      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase
        .from('power_day_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('week_number', currentWeek)
        .eq('year', currentYear);
      
      const usedCount = data?.length || 0;
      
      return {
        available: usedCount < 2,
        used: usedCount,
        max: 2,
        week: currentWeek,
        year: currentYear
      };
    } catch (error) {
      console.error('Error in checkPowerDayAvailability:', error);
      return {
        available: false,
        used: 0,
        max: 2,
        week: 0,
        year: 0
      };
    }
  }
  
  /**
   * Record a power day usage
   */
  static async recordPowerDayUsage(userId: string, week: number, year: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('power_day_usage')
        .insert({
          user_id: userId,
          week_number: week,
          year: year
        });
      
      if (error) {
        console.error('Error recording power day usage:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error recording power day usage:', error);
      return false;
    }
  }
}
