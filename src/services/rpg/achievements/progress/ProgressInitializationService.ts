
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types/achievementTypes';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { TransactionService } from '@/services/common/TransactionService';
import { ProgressBaseService } from './ProgressBaseService';

/**
 * Service for initializing achievement progress
 */
export class ProgressInitializationService extends ProgressBaseService {
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
   * Initialize progress for a specific achievement
   */
  static async initializeProgress(
    userId: string,
    achievementId: string,
    targetValue: number
  ): Promise<ServiceResponse<boolean>> {
    try {
      const progressData = [{
        achievement_id: achievementId,
        current_value: 0,
        target_value: targetValue,
        is_complete: false
      }];
      
      const { error } = await supabase
        .rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: JSON.stringify(progressData)
        });
        
      if (error) {
        return createErrorResponse(
          error.message, 
          `Failed to initialize achievement progress: ${error.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message, 
        `Exception initializing achievement progress: ${(error as Error).message}`, 
        ErrorCategory.EXCEPTION
      );
    }
  }
}
