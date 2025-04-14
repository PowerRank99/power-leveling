
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementFetchService } from './BaseAchievementFetchService';

/**
 * Service for fetching achievement statistics
 */
export class AchievementStatsService extends BaseAchievementFetchService {
  /**
   * Get achievement stats for a user
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .rpc('get_achievement_stats', { p_user_id: userId });
        
      if (error) {
        return this.handleQueryError(error, 'fetch achievement stats');
      }
      
      return createSuccessResponse(data || {});
    } catch (error) {
      return this.handleException(error, 'fetching achievement stats');
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
        return this.handleQueryError(workoutError, 'fetch workout');
      }
      
      // Get all workouts count for user
      const { count, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (countError) {
        return this.handleQueryError(countError, 'count workouts');
      }
      
      // Return results
      return createSuccessResponse({
        workoutData,
        totalWorkouts: count || 0
      });
    } catch (error) {
      return this.handleException(error, 'checking workout achievements');
    }
  }
}
