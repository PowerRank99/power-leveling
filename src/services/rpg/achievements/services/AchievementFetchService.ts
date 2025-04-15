
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
      // First get the achievement IDs unlocked by the user
      const { data: unlockedAchievements, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      if (unlockedError) throw unlockedError;
      
      // Extract the achievement IDs into an array
      const achievementIds = unlockedAchievements.map(item => item.achievement_id);
      
      // If there are no unlocked achievements, return empty stats
      if (achievementIds.length === 0) {
        return {
          success: true,
          data: []
        };
      }
      
      // Now query the achievements table with the IDs from user_achievements
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          rank,
          count(*)
        `, { count: 'exact' })
        .in('id', achievementIds)
        .groupBy('rank');
        
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
