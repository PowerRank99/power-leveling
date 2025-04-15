
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for batch operations on achievement progress
 */
export class ProgressBatchService {
  /**
   * Initialize multiple achievement progress entries in a single operation
   */
  static async initializeMultipleProgress(
    userId: string,
    achievements: any[]
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Format data for the batch update
      const progressData = achievements.map(achievement => ({
        achievement_id: achievement.id || achievement.achievementId,
        current_value: 0,
        target_value: achievement.requirements?.value || achievement.targetValue || 1,
        is_complete: false
      }));
      
      // Skip if no achievements to process
      if (progressData.length === 0) {
        return createSuccessResponse(true);
      }
      
      const { error } = await supabase
        .rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: JSON.stringify(progressData)
        });
        
      if (error) throw error;
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to initialize multiple achievement progress',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
}
