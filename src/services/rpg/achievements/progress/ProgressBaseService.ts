
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { TransactionService } from '@/services/common/TransactionService';

/**
 * Base service for achievement progress operations
 * Provides common utilities for progress services
 */
export class ProgressBaseService {
  /**
   * Get achievement progress for a specific achievement
   */
  static async getProgress(
    userId: string,
    achievementId: string
  ): Promise<ServiceResponse<any>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data: progress, error } = await supabase
          .from('achievement_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('achievement_id', achievementId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (!progress) {
          return {
            id: null,
            current: 0,
            total: 0,
            isComplete: false
          };
        }
        
        return {
          id: progress.id,
          current: progress.current_value,
          total: progress.target_value,
          isComplete: progress.is_complete,
          lastUpdated: progress.updated_at
        };
      },
      'GET_ACHIEVEMENT_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Utility method to transform progress updates to the expected format
   * for batch RPC calls
   */
  static formatProgressUpdates(progressUpdates) {
    return progressUpdates.map(update => ({
      achievement_id: update.achievementId,
      current_value: update.currentValue,
      target_value: update.targetValue,
      is_complete: update.isComplete
    }));
  }
}
