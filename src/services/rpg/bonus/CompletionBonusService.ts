
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling weekly and monthly completion bonuses
 */
export class CompletionBonusService {
  // Weekly and monthly completion bonus constants
  static readonly WEEKLY_COMPLETION_BONUS = 100;
  static readonly MONTHLY_COMPLETION_BONUS = 300;

  /**
   * Calculate weekly and monthly completion bonuses
   * Based on calendar week/month boundaries
   */
  static async calculateCompletionBonuses(
    userId: string,
    lastWorkoutAt: string | null
  ): Promise<{ weeklyBonus: number; monthlyBonus: number }> {
    try {
      const result = { weeklyBonus: 0, monthlyBonus: 0 };
      
      if (!lastWorkoutAt) return result;
      
      const now = new Date();
      
      // Get calendar week start (Monday of this week)
      const weekStart = new Date(now);
      const dayOfWeek = weekStart.getDay() || 7; // Convert Sunday (0) to 7
      weekStart.setDate(weekStart.getDate() - (dayOfWeek - 1)); // Set to Monday
      weekStart.setHours(0, 0, 0, 0);
      
      // Get calendar month start (1st of the month)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      
      // Check for weekly completion (at least 3 workouts in the current calendar week)
      const { count: weeklyWorkouts, error: weeklyError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', weekStart.toISOString())
        .lt('completed_at', now.toISOString());
        
      if (!weeklyError && weeklyWorkouts !== null && weeklyWorkouts >= 3) {
        result.weeklyBonus = this.WEEKLY_COMPLETION_BONUS;
        console.log(`Applied weekly completion bonus: +${this.WEEKLY_COMPLETION_BONUS} XP`);
      }
      
      // Check for monthly completion (at least 12 workouts in the current calendar month)
      const { count: monthlyWorkouts, error: monthlyError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', monthStart.toISOString())
        .lt('completed_at', now.toISOString());
        
      if (!monthlyError && monthlyWorkouts !== null && monthlyWorkouts >= 12) {
        result.monthlyBonus = this.MONTHLY_COMPLETION_BONUS;
        console.log(`Applied monthly completion bonus: +${this.MONTHLY_COMPLETION_BONUS} XP`);
      }
      
      return result;
    } catch (error) {
      console.error('Error calculating completion bonuses:', error);
      return { weeklyBonus: 0, monthlyBonus: 0 };
    }
  }
}
