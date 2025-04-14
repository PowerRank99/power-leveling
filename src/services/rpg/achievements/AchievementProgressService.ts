import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { Achievement, AchievementCategory } from '@/types/achievementTypes';
import { ProgressBatchService } from './progress/ProgressBatchService';
import { TransactionService } from '@/services/common/TransactionService';

/**
 * Service for handling achievement progress updates
 * Uses optimized batch operations to minimize database calls
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
      // Validate achievement exists
      const achievement = AchievementUtils.getAchievementById(achievementId);
      if (!achievement) {
        return createErrorResponse(
          'Invalid achievement',
          `Achievement with ID ${achievementId} not found in definitions`,
          ErrorCategory.VALIDATION
        );
      }
      
      const progressData = [{
        achievement_id: achievementId,
        current_value: currentValue,
        target_value: targetValue,
        is_complete: isComplete
      }];
      
      const { data, error } = await supabase
        .rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: JSON.stringify(progressData)
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
   * Uses batch operations for efficiency 
   */
  static async initializeMultipleProgress(
    userId: string,
    achievements: Achievement[]
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Validate input
      if (!userId || !achievements.length) {
        return createSuccessResponse(true); // Nothing to do
      }
      
      const progressData = achievements.map(achievement => ({
        achievement_id: achievement.id,
        current_value: 0,
        target_value: achievement.requirements.value,
        is_complete: false
      }));
      
      // Use transaction service for retry logic
      return TransactionService.executeWithRetry(
        async () => {
          const { error } = await supabase
            .rpc('batch_update_achievement_progress', {
              p_user_id: userId,
              p_achievements: JSON.stringify(progressData)
            });
            
          if (error) throw error;
          return true;
        },
        'INITIALIZE_MULTIPLE_PROGRESS',
        3,
        'Failed to initialize achievement progress'
      );
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
      // Validate input
      if (!userId || !progressUpdates.length) {
        return createSuccessResponse(true); // Nothing to do
      }
      
      // Transform to match the expected format for the RPC function
      const progressData = progressUpdates.map(update => ({
        achievement_id: update.achievementId,
        current_value: update.currentValue,
        target_value: update.targetValue,
        is_complete: update.isComplete
      }));
      
      // Use transaction service for retry logic
      return TransactionService.executeWithRetry(
        async () => {
          const { error } = await supabase
            .rpc('batch_update_achievement_progress', {
              p_user_id: userId,
              p_achievements: JSON.stringify(progressData)
            });
            
          if (error) throw error;
          return true;
        },
        'UPDATE_MULTIPLE_PROGRESS',
        3,
        'Failed to update achievement progress values'
      );
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
   * Delegates to ProgressBatchService for optimized processing
   */
  static async updateStreakProgress(
    userId: string,
    currentStreak: number
  ): Promise<ServiceResponse<boolean>> {
    const result = await ProgressBatchService.updateStreakProgress(userId, currentStreak);
    return createSuccessResponse(result.success);
  }
  
  /**
   * Update workout count progress for relevant achievements
   * Delegates to ProgressBatchService for optimized processing
   */
  static async updateWorkoutCountProgress(
    userId: string,
    workoutCount: number
  ): Promise<ServiceResponse<boolean>> {
    const result = await ProgressBatchService.updateWorkoutCountProgress(userId, workoutCount);
    return createSuccessResponse(result.success);
  }
  
  /**
   * Update personal record progress for relevant achievements
   * Delegates to ProgressBatchService for optimized processing
   */
  static async updatePersonalRecordProgress(
    userId: string,
    recordCount: number
  ): Promise<ServiceResponse<boolean>> {
    const result = await ProgressBatchService.updatePersonalRecordProgress(userId, recordCount);
    return createSuccessResponse(result.success);
  }
  
  /**
   * Batch update progress for achievements by category
   * Use for category-specific updates
   */
  static async batchUpdateByCategory(
    userId: string,
    category: AchievementCategory,
    requirementType: string,
    currentValue: number
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get matching achievements from centralized definitions
        const relevantAchievements = AchievementUtils
          .getAchievementsByCategory(category)
          .filter(a => a.requirementType === requirementType);
          
        const progressUpdates = relevantAchievements.map(achievement => ({
          achievementId: achievement.id,
          currentValue: currentValue,
          targetValue: achievement.requirementValue,
          isComplete: currentValue >= achievement.requirementValue
        }));
        
        return this.updateMultipleProgressValues(userId, progressUpdates).then(result => result.success);
      },
      `UPDATE_${category.toUpperCase()}_${requirementType.toUpperCase()}_PROGRESS`,
      { showToast: false }
    );
  }
}
