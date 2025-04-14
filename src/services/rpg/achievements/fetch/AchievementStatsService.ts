
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { AchievementUtils } from '@/constants/achievements';
import { Achievement, AchievementCategory, AchievementRank, AchievementStats } from '@/types/achievementTypes';

/**
 * Service for fetching and processing achievement statistics
 */
export class AchievementStatsService {
  /**
   * Get achievement statistics for a user
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<AchievementStats>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Fetch achievement stats from the database function
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_achievement_stats', {
            p_user_id: userId
          });
          
        if (statsError) {
          throw statsError;
        }
        
        // Get recently unlocked achievements
        const { data: recentAchievements, error: recentError } = await supabase
          .from('user_achievements')
          .select(`
            achievement_id,
            achieved_at,
            achievements (
              id, name, description, category, rank, points, xp_reward, icon_name, requirements
            )
          `)
          .eq('user_id', userId)
          .order('achieved_at', { ascending: false })
          .limit(5);
          
        if (recentError) {
          throw recentError;
        }
        
        // Convert recently unlocked achievements to Achievement objects
        const recentlyUnlocked: Achievement[] = [];
        
        if (recentAchievements) {
          // Process each achievement with safe type handling
          recentAchievements.forEach(item => {
            if (item.achievements) {
              const achievementData = item.achievements as Record<string, any>;
              
              recentlyUnlocked.push({
                id: achievementData.id,
                name: achievementData.name,
                description: achievementData.description,
                category: achievementData.category as AchievementCategory,
                rank: achievementData.rank as AchievementRank,
                points: achievementData.points,
                xpReward: achievementData.xp_reward,
                iconName: achievementData.icon_name,
                requirements: achievementData.requirements,
                achievedAt: item.achieved_at
              });
            }
          });
        }
        
        // Return the achievement stats
        return {
          total: statsData?.total || 0,
          unlocked: statsData?.unlocked || 0,
          points: statsData?.points || 0,
          byRank: {
            S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, Unranked: 0
          },
          byCategory: {},
          recentlyUnlocked
        };
      }, 
      'GET_ACHIEVEMENT_STATS', 
      { showToast: false }
    );
  }
}
