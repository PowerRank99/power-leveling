import { ServiceResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';
import { AchievementRepository } from '../AchievementRepository';

export class AchievementFetchService {
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    return AchievementRepository.getAllAchievements();
  }

  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return AchievementRepository.getUnlockedAchievements(userId);
  }

  static async getAchievementById(achievementId: string): Promise<ServiceResponse<Achievement | null>> {
    return AchievementRepository.getAchievementById(achievementId);
  }

  static async getAchievementByStringId(stringId: string): Promise<ServiceResponse<Achievement | null>> {
    return AchievementRepository.getAchievementByStringId(stringId);
  }
  
  static async getAchievementStats(userId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          rank,
          count(*)
        `)
        .eq('user_achievements.user_id', userId)
        .join('user_achievements', { 
          sourceColumn: 'id',
          foreignTable: 'user_achievements',
          foreignColumn: 'achievement_id'
        })
        .group_by('rank');
        
      if (error) throw error;
      
      return {
        success: true,
        data
      };
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch achievement stats',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  static async getAllAchievementProgress(userId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('achievement_progress')
        .select(`
          id,
          achievement_id,
          current_value,
          target_value,
          is_complete,
          updated_at,
          achievements!inner (
            name,
            description,
            category,
            rank,
            points,
            xp_reward,
            icon_name,
            string_id,
            requirements
          )
        `)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      return {
        success: true,
        data
      };
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch achievement progress',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
}
