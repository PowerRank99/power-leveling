
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';

/**
 * Service for fetching achievement progress
 */
export class AchievementProgressFetchService {
  /**
   * Get achievement progress for a specific achievement
   */
  static async getAchievementProgress(userId: string, achievementId: string): Promise<ServiceResponse<any>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId || !achievementId) {
          return createErrorResponse(
            'Invalid parameters',
            'User ID and achievement ID are required',
            ErrorCategory.VALIDATION
          ).data;
        }
        
        // Get progress for the specific achievement
        const { data: progress, error: progressError } = await supabase
          .from('achievement_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('achievement_id', achievementId)
          .maybeSingle();
          
        if (progressError) {
          throw new Error(`Failed to fetch achievement progress: ${progressError.message}`);
        }
        
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
   * Get all achievement progress for a user
   */
  static async getAllAchievementProgress(userId: string): Promise<ServiceResponse<any>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) {
          return createErrorResponse(
            'User ID is required',
            'User ID is required to fetch achievement progress',
            ErrorCategory.VALIDATION
          ).data;
        }
        
        // Use RPC function to get all progress
        const { data: progress, error: progressError } = await supabase
          .rpc('get_all_achievement_progress', { p_user_id: userId });
          
        if (progressError) {
          throw new Error(`Failed to fetch achievement progress: ${progressError.message}`);
        }
        
        return progress || {};
      },
      'GET_ALL_ACHIEVEMENT_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Create or update achievement progress
   */
  static async updateAchievementProgress(
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
          `Failed to update achievement progress: ${error.message}`, 
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
}
