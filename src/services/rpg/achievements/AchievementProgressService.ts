
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { AchievementUtils } from '@/constants/achievements';
import { Achievement, AchievementCategory } from '@/types/achievementTypes';

/**
 * Service for handling achievement progress updates
 */
export class AchievementProgressService {
  /**
   * Update achievement progress for a specific achievement
   */
  static async updateProgress(
    userId: string,
    achievementId: string,
    currentValue: number,
    targetValue: number,
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    try {
      const progressData = [{
        achievement_id: achievementId,
        current_value: currentValue,
        target_value: targetValue,
        is_complete: isComplete
      }];
      
      const { data, error } = await supabase
        .rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: progressData
        });
        
      if (error) {
        return createErrorResponse(
          error.message, 
          `Failed to update achievement progress for ${achievementId}: ${error.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message, 
        `Exception updating achievement progress: ${(error as Error).message}`, 
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Initialize progress for one or more achievements
   */
  static async initializeMultipleProgress(
    userId: string,
    achievements: Achievement[]
  ): Promise<ServiceResponse<boolean>> {
    try {
      const progressData = achievements.map(achievement => ({
        achievement_id: achievement.id,
        current_value: 0,
        target_value: achievement.requirements.value,
        is_complete: false
      }));
      
      if (progressData.length === 0) {
        return createSuccessResponse(true);
      }
      
      const { data, error } = await supabase
        .rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: progressData
        });
        
      if (error) {
        return createErrorResponse(
          error.message, 
          `Failed to initialize multiple achievement progress: ${error.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message, 
        `Exception initializing multiple achievement progress: ${(error as Error).message}`, 
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Update multiple achievement progress values in a single operation
   * Optimizes database calls by batching updates
   */
  static async updateMultipleProgressValues(
    userId: string,
    progressUpdates: Array<{
      achievementId: string,
      currentValue: number,
      targetValue: number,
      isComplete: boolean
    }>
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Transform to match the expected format for the RPC function
      const progressData = progressUpdates.map(update => ({
        achievement_id: update.achievementId,
        current_value: update.currentValue,
        target_value: update.targetValue,
        is_complete: update.isComplete
      }));
      
      if (progressData.length === 0) {
        return createSuccessResponse(true);
      }
      
      const { data, error } = await supabase
        .rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: progressData
        });
        
      if (error) {
        return createErrorResponse(
          error.message, 
          `Failed to update multiple achievement progress values: ${error.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message, 
        `Exception updating multiple achievement progress values: ${(error as Error).message}`, 
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Update streak progress for relevant achievements
   */
  static async updateStreakProgress(
    userId: string,
    currentStreak: number
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const streakAchievements = AchievementUtils
          .getAchievementsByCategory(AchievementCategory.STREAK)
          .filter(a => a.requirementType === 'streak_days');
          
        const progressUpdates = streakAchievements.map(achievement => ({
          achievementId: achievement.id,
          currentValue: currentStreak,
          targetValue: achievement.requirementValue,
          isComplete: currentStreak >= achievement.requirementValue
        }));
        
        return this.updateMultipleProgressValues(userId, progressUpdates).then(result => result.success);
      },
      'UPDATE_STREAK_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Update workout count progress for relevant achievements
   */
  static async updateWorkoutCountProgress(
    userId: string,
    workoutCount: number
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const workoutAchievements = AchievementUtils
          .getAchievementsByCategory(AchievementCategory.WORKOUT)
          .filter(a => a.requirementType === 'workouts_count');
          
        const progressUpdates = workoutAchievements.map(achievement => ({
          achievementId: achievement.id,
          currentValue: workoutCount,
          targetValue: achievement.requirementValue,
          isComplete: workoutCount >= achievement.requirementValue
        }));
        
        return this.updateMultipleProgressValues(userId, progressUpdates).then(result => result.success);
      },
      'UPDATE_WORKOUT_COUNT_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Update personal record progress for relevant achievements
   */
  static async updatePersonalRecordProgress(
    userId: string,
    recordCount: number
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const recordAchievements = AchievementUtils
          .getAchievementsByCategory(AchievementCategory.RECORD)
          .filter(a => a.requirementType === 'pr_count');
          
        const progressUpdates = recordAchievements.map(achievement => ({
          achievementId: achievement.id,
          currentValue: recordCount,
          targetValue: achievement.requirementValue,
          isComplete: recordCount >= achievement.requirementValue
        }));
        
        return this.updateMultipleProgressValues(userId, progressUpdates).then(result => result.success);
      },
      'UPDATE_RECORD_PROGRESS',
      { showToast: false }
    );
  }
}
