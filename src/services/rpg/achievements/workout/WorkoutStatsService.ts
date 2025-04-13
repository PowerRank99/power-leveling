
import { supabase } from '@/integrations/supabase/client';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';

/**
 * Service for fetching workout statistics needed for achievement checking
 */
export class WorkoutStatsService {
  /**
   * Get workout statistics for a user
   */
  static async getWorkoutStats(userId: string): Promise<UserWorkoutStats> {
    try {
      // Get current date ranges
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Get total workout count
      const { count: totalCount, error: totalError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (totalError) throw totalError;
      
      // Get weekly workout count
      const { count: weeklyCount, error: weeklyError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', weekStart.toISOString());
        
      if (weeklyError) throw weeklyError;
      
      // Get monthly workout count
      const { count: monthlyCount, error: monthlyError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', monthStart.toISOString());
        
      if (monthlyError) throw monthlyError;
      
      return {
        totalCount: totalCount || 0,
        weeklyCount: weeklyCount || 0,
        monthlyCount: monthlyCount || 0
      };
    } catch (error) {
      console.error('Error getting workout stats:', error);
      return { totalCount: 0, weeklyCount: 0, monthlyCount: 0 };
    }
  }

  /**
   * Get user profile data
   */
  static async getUserProfile(userId: string): Promise<UserProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}
