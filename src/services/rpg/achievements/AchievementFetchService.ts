
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types/achievementTypes';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementVerificationService } from './AchievementVerificationService';

/**
 * Service for fetching achievements and achievement stats
 */
export class AchievementFetchService {
  /**
   * Get all unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            id,
            achievement_id,
            achieved_at,
            achievements (
              id,
              name,
              description,
              category,
              rank,
              points,
              xp_reward,
              icon_name,
              requirements
            )
          `)
          .eq('user_id', userId)
          .order('achieved_at', { ascending: false });
          
        if (error) throw error;
        
        return data.map(item => ({
          id: item.achievement_id,
          name: item.achievements.name,
          description: item.achievements.description,
          category: item.achievements.category,
          rank: item.achievements.rank,
          points: item.achievements.points,
          xpReward: item.achievements.xp_reward,
          iconName: item.achievements.icon_name,
          requirements: item.achievements.requirements as Record<string, any>,
          achievedAt: item.achieved_at
        }));
      },
      'GET_UNLOCKED_ACHIEVEMENTS',
      {
        userMessage: 'Não foi possível carregar suas conquistas',
        showToast: false
      }
    );
  }
  
  /**
   * Get achievement stats using the database function
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<any>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data, error } = await supabase.rpc('get_achievement_stats', {
          p_user_id: userId
        });
        
        if (error) throw error;
        
        return data;
      },
      'GET_ACHIEVEMENT_STATS',
      {
        userMessage: 'Não foi possível carregar as estatísticas de conquistas',
        showToast: false
      }
    );
  }
  
  /**
   * Check for achievements related to a specific workout
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<ServiceResponse<void>> {
    return AchievementVerificationService.checkWorkoutAchievements(userId, workoutId);
  }
}
