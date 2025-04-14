
import { supabase } from '@/integrations/supabase/client';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { TransactionService } from '@/services/common/TransactionService';
import { ProgressBaseService } from './ProgressBaseService';

/**
 * Service for updating achievement progress
 */
export class ProgressUpdateService extends ProgressBaseService {
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
      
      const { error } = await supabase
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
      const progressData = ProgressBaseService.formatProgressUpdates(progressUpdates);
      
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
}
