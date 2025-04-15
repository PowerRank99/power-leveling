
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { ProgressBaseService } from './progress/ProgressBaseService';
import { AchievementProgress } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';
import { AchievementCategory } from '@/types/achievementTypes';

/**
 * Service for managing achievement progress
 */
export class AchievementProgressService {
  /**
   * Get progress for a specific achievement
   */
  static async getAchievementProgress(
    userId: string,
    achievementId: string
  ): Promise<ServiceResponse<AchievementProgress | null>> {
    return ProgressBaseService.getProgress(userId, achievementId);
  }
  
  /**
   * Update progress for a specific achievement
   */
  static async updateProgress(
    userId: string,
    achievementId: string,
    currentValue: number,
    targetValue: number,
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    try {
      if (!userId || !achievementId) {
        return createErrorResponse(
          'Invalid parameters',
          'User ID and achievement ID are required',
          ErrorCategory.VALIDATION
        );
      }
      
      // Insert or update the progress record
      const { error } = await supabase.from('achievement_progress')
        .upsert({
          user_id: userId,
          achievement_id: achievementId,
          current_value: currentValue,
          target_value: targetValue,
          is_complete: isComplete,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,achievement_id'
        });
        
      if (error) throw error;
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to update achievement progress',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Update progress for multiple achievements in a batch
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
      if (!userId || !progressUpdates.length) {
        return createErrorResponse(
          'Invalid parameters',
          'User ID and progress updates are required',
          ErrorCategory.VALIDATION
        );
      }
      
      // Format the updates for the batch operation
      const formattedUpdates = ProgressBaseService.formatProgressUpdates(progressUpdates);
      
      // Use Supabase RPC for better performance
      const { error } = await supabase.rpc(
        'batch_update_achievement_progress',
        {
          p_user_id: userId,
          p_achievements: JSON.stringify(formattedUpdates)
        }
      );
      
      if (error) throw error;
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to update multiple achievement progress values',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }

  /**
   * Initialize progress for multiple achievements
   */
  static async initializeMultipleProgress(
    userId: string,
    achievements: any[]
  ): Promise<ServiceResponse<boolean>> {
    try {
      if (!userId || !achievements.length) {
        return createSuccessResponse(true); // Nothing to do
      }
      
      const progressData = achievements.map(achievement => ({
        achievement_id: achievement.id,
        current_value: 0,
        target_value: achievement.requirements.value || 1,
        is_complete: false
      }));
      
      const { error } = await supabase
        .rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: JSON.stringify(progressData)
        });
        
      if (error) throw error;
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to initialize achievement progress',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }

  /**
   * Update streak progress for all streak-related achievements
   */
  static async updateStreakProgress(
    userId: string,
    currentStreak: number
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Get all streak-related achievements
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, requirements')
        .eq('category', AchievementCategory.STREAK);
      
      if (error) throw error;
      
      if (!achievements || achievements.length === 0) {
        return createSuccessResponse(true);
      }
      
      // Prepare updates
      const progressUpdates = achievements.map(achievement => {
        const requirementValue = achievement.requirements.value || 1;
        const isComplete = currentStreak >= requirementValue;
        
        return {
          achievementId: achievement.id,
          currentValue: Math.min(currentStreak, requirementValue),
          targetValue: requirementValue,
          isComplete
        };
      });
      
      // Update all streak achievements
      return this.updateMultipleProgressValues(userId, progressUpdates);
    } catch (error) {
      return createErrorResponse(
        'Failed to update streak progress',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }

  /**
   * Update workout count progress for all workout count achievements
   */
  static async updateWorkoutCountProgress(
    userId: string,
    workoutCount: number
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Get all workout count-related achievements
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, requirements')
        .eq('category', AchievementCategory.WORKOUT_COUNT);
      
      if (error) throw error;
      
      if (!achievements || achievements.length === 0) {
        return createSuccessResponse(true);
      }
      
      // Prepare updates
      const progressUpdates = achievements.map(achievement => {
        const requirementValue = achievement.requirements.value || 1;
        const isComplete = workoutCount >= requirementValue;
        
        return {
          achievementId: achievement.id,
          currentValue: Math.min(workoutCount, requirementValue),
          targetValue: requirementValue,
          isComplete
        };
      });
      
      // Update all workout count achievements
      return this.updateMultipleProgressValues(userId, progressUpdates);
    } catch (error) {
      return createErrorResponse(
        'Failed to update workout count progress',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }

  /**
   * Update personal record progress for all PR-related achievements
   */
  static async updatePersonalRecordProgress(
    userId: string,
    recordCount: number
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Get all personal record-related achievements
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, requirements')
        .eq('category', AchievementCategory.PERSONAL_RECORD);
      
      if (error) throw error;
      
      if (!achievements || achievements.length === 0) {
        return createSuccessResponse(true);
      }
      
      // Prepare updates
      const progressUpdates = achievements.map(achievement => {
        const requirementValue = achievement.requirements.value || 1;
        const isComplete = recordCount >= requirementValue;
        
        return {
          achievementId: achievement.id,
          currentValue: Math.min(recordCount, requirementValue),
          targetValue: requirementValue,
          isComplete
        };
      });
      
      // Update all personal record achievements
      return this.updateMultipleProgressValues(userId, progressUpdates);
    } catch (error) {
      return createErrorResponse(
        'Failed to update personal record progress',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }
}
