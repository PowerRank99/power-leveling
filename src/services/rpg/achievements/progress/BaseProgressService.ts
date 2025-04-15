import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementProgress } from '@/types/achievementTypes';

/**
 * Base class for achievement progress services
 */
export class BaseProgressService {
  /**
   * Get progress for a specific achievement
   */
  static async getProgress(
    userId: string,
    achievementId: string
  ): Promise<ServiceResponse<AchievementProgress | null>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('achievement_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('achievement_id', achievementId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (!data) return null;
        
        return {
          id: data.id,
          current: data.current_value,
          total: data.target_value,
          isComplete: data.is_complete
        };
      },
      'GET_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Get progress for all achievements of a user
   * Uses the optimized database function
   */
  static async getAllProgress(userId: string): Promise<ServiceResponse<Record<string, AchievementProgress>>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data, error } = await supabase.rpc(
          'get_all_achievement_progress',
          { p_user_id: userId }
        );
          
        if (error) throw error;
        
        // Parse the JSON result into our expected format
        const progressMap: Record<string, AchievementProgress> = {};
        
        if (data) {
          Object.entries(data).forEach(([achievementId, progressData]: [string, any]) => {
            progressMap[achievementId] = {
              id: progressData.id,
              current: progressData.current,
              total: progressData.total,
              isComplete: progressData.isComplete
            };
          });
        }
        
        return progressMap;
      },
      'GET_ALL_PROGRESS',
      { showToast: false }
    );
  }
}
