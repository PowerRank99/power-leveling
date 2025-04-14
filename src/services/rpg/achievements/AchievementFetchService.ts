
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createErrorResponse, createSuccessResponse } from '@/services/common/ErrorHandlingService';

/**
 * Service for fetching achievement data
 */
export class AchievementFetchService {
  /**
   * Get all achievements
   */
  static async getAllAchievements(): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank');
        
      if (error) {
        return createErrorResponse(error.message, error.message);
      }
      
      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse((error as Error).message, (error as Error).message);
    }
  }
  
  /**
   * Get unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<any[]>> {
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
        return createErrorResponse(error.message, error.message);
      }
      
      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse((error as Error).message, (error as Error).message);
    }
  }
  
  /**
   * Get achievement stats for a user
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .rpc('get_achievement_stats', { p_user_id: userId });
        
      if (error) {
        return createErrorResponse(error.message, error.message);
      }
      
      return createSuccessResponse(data || {});
    } catch (error) {
      return createErrorResponse((error as Error).message, (error as Error).message);
    }
  }
  
  /**
   * Check for achievements related to workouts
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<ServiceResponse<any>> {
    try {
      // Get workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
        
      if (workoutError) {
        return createErrorResponse(workoutError.message, workoutError.message);
      }
      
      // Get all workouts count for user
      const { count, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (countError) {
        return createErrorResponse(countError.message, countError.message);
      }
      
      // Return results
      return createSuccessResponse({
        workoutData,
        totalWorkouts: count || 0
      });
    } catch (error) {
      return createErrorResponse((error as Error).message, (error as Error).message);
    }
  }
}
