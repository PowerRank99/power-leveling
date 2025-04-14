
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { TransactionService } from '@/services/common/TransactionService';

/**
 * Service for generic batch achievement progress updates
 */
export class GenericProgressBatchService {
  /**
   * Generic batch update method for achievements
   * Can be used for any type of achievement progress update
   */
  static async batchUpdateProgress(
    userId: string,
    achievements: Array<{
      achievementId: string,
      currentValue: number,
      targetValue: number,
      isComplete: boolean
    }>
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId || !achievements.length) {
          console.log('No achievements to update');
          return;
        }
        
        // Format the data for the RPC call
        const progressData = achievements.map(achievement => ({
          achievement_id: achievement.achievementId,
          current_value: achievement.currentValue,
          target_value: achievement.targetValue,
          is_complete: achievement.isComplete
        }));
        
        // Use the batch update function with retry logic
        const result = await TransactionService.executeWithRetry(
          async () => {
            const { error } = await supabase.rpc('batch_update_achievement_progress', {
              p_user_id: userId,
              p_achievements: JSON.stringify(progressData)
            });
            
            if (error) throw error;
            return true;
          },
          'BATCH_UPDATE_PROGRESS',
          3,
          'Failed to update achievement progress in batch'
        );
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to update progress in batch');
        }
      },
      'BATCH_UPDATE_ACHIEVEMENT_PROGRESS',
      { showToast: false }
    );
  }
}
