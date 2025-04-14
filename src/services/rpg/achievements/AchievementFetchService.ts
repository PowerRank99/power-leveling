import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorCategory, createErrorResponse, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { Achievement, UserAchievementData } from '@/types/achievementTypes';

/**
 * Service for fetching achievement data
 */
export class AchievementFetchService {
  /**
   * Get all achievements
   */
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank');
        
      if (error) {
        return createErrorResponse(
          error.message, 
          `Failed to fetch achievements: ${error.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      // Transform the data to match our Achievement interface
      const achievements = data?.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        rank: achievement.rank,
        points: achievement.points,
        xpReward: achievement.xp_reward,
        iconName: achievement.icon_name,
        requirements: achievement.requirements,
        isUnlocked: false
      })) || [];
      
      return createSuccessResponse(achievements);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message, 
        `Exception fetching achievements: ${(error as Error).message}`, 
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Get unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
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
        return createErrorResponse(
          error.message, 
          `Failed to fetch unlocked achievements: ${error.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      // Explicit type casting and safe transformation
      const achievements = (data as UserAchievementData[])?.map(item => ({
        id: item.achievement_id,
        name: item.achievements.name,
        description: item.achievements.description,
        category: item.achievements.category,
        rank: item.achievements.rank,
        points: item.achievements.points,
        xpReward: item.achievements.xp_reward,
        iconName: item.achievements.icon_name,
        requirements: item.achievements.requirements,
        isUnlocked: true,
        achievedAt: item.achieved_at
      })) || [];
      
      return createSuccessResponse(achievements);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message, 
        `Exception fetching unlocked achievements: ${(error as Error).message}`, 
        ErrorCategory.EXCEPTION
      );
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
        return createErrorResponse(
          error.message, 
          `Failed to fetch achievement stats: ${error.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      return createSuccessResponse(data || {});
    } catch (error) {
      return createErrorResponse(
        (error as Error).message, 
        `Exception fetching achievement stats: ${(error as Error).message}`, 
        ErrorCategory.EXCEPTION
      );
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
        return createErrorResponse(
          workoutError.message, 
          `Failed to fetch workout: ${workoutError.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      // Get all workouts count for user
      const { count, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (countError) {
        return createErrorResponse(
          countError.message, 
          `Failed to count workouts: ${countError.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      // Return results
      return createSuccessResponse({
        workoutData,
        totalWorkouts: count || 0
      });
    } catch (error) {
      return createErrorResponse(
        (error as Error).message, 
        `Exception checking workout achievements: ${(error as Error).message}`, 
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Get achievement progress for a user
   */
  static async getAchievementProgress(userId: string, achievementId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .rpc('get_achievement_progress_by_id', { 
          p_user_id: userId,
          p_achievement_id: achievementId
        });
        
      if (error) {
        return createErrorResponse(
          error.message, 
          `Failed to fetch achievement progress: ${error.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      return createSuccessResponse(data || null);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message, 
        `Exception fetching achievement progress: ${(error as Error).message}`, 
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Get all achievement progress for a user
   */
  static async getAllAchievementProgress(userId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .rpc('get_all_achievement_progress', { p_user_id: userId });
        
      if (error) {
        return createErrorResponse(
          error.message, 
          `Failed to fetch all achievement progress: ${error.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      return createSuccessResponse(data || {});
    } catch (error) {
      return createErrorResponse(
        (error as Error).message, 
        `Exception fetching all achievement progress: ${(error as Error).message}`, 
        ErrorCategory.EXCEPTION
      );
    }
  }
}
