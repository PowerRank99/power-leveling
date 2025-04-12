
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling Power Day functionality
 * Power Day allows users to exceed the daily XP cap (2x per week)
 */
export class PowerDayService {
  static readonly POWER_DAY_CAP = 500;
  static readonly POWER_DAYS_PER_WEEK = 2;
  
  /**
   * Check if a user has Power Day availability
   * Returns information about power day usage for the current week
   */
  static async checkPowerDayAvailability(userId: string): Promise<{
    available: boolean;
    used: number;
    max: number;
    week: number;
    year: number;
  }> {
    try {
      if (!userId) {
        console.error('checkPowerDayAvailability: No userId provided');
        throw new Error('User ID is required');
      }
      
      // Get current week and year
      const now = new Date();
      const week = this.getWeekNumber(now);
      const year = now.getFullYear();
      
      // Query database for power day usage in the current week
      const { data, error } = await supabase
        .from('power_day_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('week_number', week)
        .eq('year', year);
      
      if (error) {
        console.error('Error checking power day usage:', error);
        throw error;
      }
      
      // Count used power days
      const usedPowerDays = data ? data.length : 0;
      
      return {
        available: usedPowerDays < this.POWER_DAYS_PER_WEEK,
        used: usedPowerDays,
        max: this.POWER_DAYS_PER_WEEK,
        week,
        year
      };
    } catch (error) {
      console.error('Error in checkPowerDayAvailability:', error);
      // Return a default object instead of throwing
      return {
        available: false,
        used: 0,
        max: this.POWER_DAYS_PER_WEEK,
        week: this.getWeekNumber(new Date()),
        year: new Date().getFullYear()
      };
    }
  }
  
  /**
   * Record a power day usage
   * Returns true if successful, false otherwise
   */
  static async recordPowerDayUsage(userId: string, week: number, year: number): Promise<boolean> {
    try {
      if (!userId) {
        console.error('recordPowerDayUsage: No userId provided');
        throw new Error('User ID is required');
      }
      
      // Check availability first
      const availability = await this.checkPowerDayAvailability(userId);
      
      if (!availability.available) {
        console.warn('User has no power day availability this week');
        return false;
      }
      
      // FIX: Use direct table insert instead of RPC function
      const { data, error } = await supabase
        .from('power_day_usage')
        .insert({
          user_id: userId,
          week_number: week,
          year: year,
          used_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error recording power day usage:', error);
        throw error;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error in recordPowerDayUsage:', error);
      return false;
    }
  }
  
  /**
   * Helper function to get the ISO week number
   */
  static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
