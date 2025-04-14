
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementFetchService } from './BaseAchievementFetchService';

/**
 * Service for fetching achievement progress data
 */
export class AchievementProgressFetchService extends BaseAchievementFetchService {
  /**
   * Get achievement progress for a user
   */
  static async getAchievementProgress(userId: string, achievementId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .rpc('get_achievement_progress_by_id', { 
          p_user_id: userId,
          p_achievement_id: achievementId
        });
        
      if (error) {
        return this.handleQueryError(error, 'fetch achievement progress');
      }
      
      return createSuccessResponse(data || null);
    } catch (error) {
      return this.handleException(error, 'fetching achievement progress');
    }
  }
  
  /**
   * Get all achievement progress for a user
   */
  static async getAllAchievementProgress(userId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .rpc('get_all_achievement_progress', { p_user_id: userId });
        
      if (error) {
        return this.handleQueryError(error, 'fetch all achievement progress');
      }
      
      return createSuccessResponse(data || {});
    } catch (error) {
      return this.handleException(error, 'fetching all achievement progress');
    }
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
        return this.handleQueryError(error, 'update achievement progress');
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return this.handleException(error, 'updating achievement progress');
    }
  }
}
