
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { ProgressBaseService } from './progress/ProgressBaseService';
import { AchievementProgress } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';

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
}
