
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementProgress } from '@/types/achievementTypes';
import { CachingService } from '@/services/common/CachingService';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class ProgressBaseService {
  static async getProgress(
    userId: string,
    achievementId: string
  ): Promise<ServiceResponse<AchievementProgress | null>> {
    const cacheKey = `achievement_progress_${userId}_${achievementId}`;
    const cached = CachingService.get<AchievementProgress>(cacheKey);
    if (cached) return { success: true, data: cached };

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
        
        const progress: AchievementProgress = {
          id: data.id,
          current: data.current_value,
          total: data.target_value,
          isComplete: data.is_complete
        };

        CachingService.set(cacheKey, progress, CACHE_DURATION);
        return progress;
      },
      'GET_PROGRESS',
      { showToast: false }
    );
  }
  
  static async getAllProgress(userId: string): Promise<ServiceResponse<Record<string, AchievementProgress>>> {
    const cacheKey = `all_achievement_progress_${userId}`;
    const cached = CachingService.get<Record<string, AchievementProgress>>(cacheKey);
    if (cached) return { success: true, data: cached };

    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data, error } = await supabase.rpc(
          'get_all_achievement_progress',
          { p_user_id: userId }
        );
          
        if (error) throw error;
        
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
        
        CachingService.set(cacheKey, progressMap, CACHE_DURATION);
        return progressMap;
      }, 
      'GET_ALL_PROGRESS', 
      { showToast: false }
    );
  }
  
  static formatProgressUpdates(progressUpdates: Array<{
    achievementId: string,
    currentValue: number,
    targetValue: number,
    isComplete: boolean
  }>): any[] {
    return progressUpdates.map(update => ({
      achievement_id: update.achievementId,
      current_value: update.currentValue,
      target_value: update.targetValue,
      is_complete: update.isComplete
    }));
  }
}
