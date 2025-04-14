
import { supabase } from '@/integrations/supabase/client';
import { createSuccessResult, createErrorResult } from '@/utils/serviceUtils';
import { DatabaseResult } from '@/types/workout';

/**
 * Service for fetching achievement data
 */
export class AchievementFetchService {
  /**
   * Get all achievements
   */
  static async getAllAchievements() {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank');
        
      if (error) {
        return createErrorResult(error);
      }
      
      return createSuccessResult(data);
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }
  
  /**
   * Get unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          achieved_at,
          achievements:achievement_id (
            id,
            name,
            description,
            category,
            rank,
            points,
            xp_reward,
            icon_name,
            requirements
          )
        `)
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });
        
      if (error) {
        return createErrorResult(error);
      }
      
      return createSuccessResult(data);
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }
  
  /**
   * Get achievement stats for a user
   */
  static async getAchievementStats(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_achievement_stats', { p_user_id: userId });
        
      if (error) {
        return createErrorResult(error);
      }
      
      return createSuccessResult(data);
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }
  
  /**
   * Check for achievements related to workouts
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string) {
    try {
      // Get workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
        
      if (workoutError) {
        return createErrorResult(workoutError);
      }
      
      // Get all workouts count for user
      const { count, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (countError) {
        return createErrorResult(countError);
      }
      
      // Return results
      return createSuccessResult({
        workoutData,
        totalWorkouts: count || 0
      });
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }
}
