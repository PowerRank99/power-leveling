
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { Achievement, AchievementCategory, AchievementRank, AchievementStats } from '@/types/achievementTypes';
import { mapToAchievementCategory, mapToAchievementRank } from '@/types/achievementMappers';

/**
 * Service for fetching achievement statistics
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
            achievement:achievement_id (
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
          recentAchievements.forEach((item: any) => {
            if (item.achievement) {
              const achievementData = item.achievement as Record<string, any>;
              
              recentlyUnlocked.push({
                id: achievementData.id,
                name: achievementData.name,
                description: achievementData.description,
                category: mapToAchievementCategory(achievementData.category),
                rank: mapToAchievementRank(achievementData.rank),
                points: achievementData.points,
                xpReward: achievementData.xp_reward,
                iconName: achievementData.icon_name,
                requirements: achievementData.requirements,
                achievedAt: item.achieved_at,
                stringId: achievementData.string_id
              });
            }
          });
        }
        
        // Create default category stats object
        const byCategory: Partial<Record<AchievementCategory, number>> = {};
        
        // Initialize with empty values for all categories
        Object.values(AchievementCategory).forEach(category => {
          byCategory[category] = 0;
        });
        
        // Return the achievement stats
        const stats: AchievementStats = {
          total: statsData?.total || 0,
          unlocked: statsData?.unlocked || 0,
          points: statsData?.points || 0,
          byRank: {
            S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, Unranked: 0
          },
          byCategory: byCategory,
          recentlyUnlocked
        };
        
        return stats;
      }, 
      'GET_ACHIEVEMENT_STATS', 
      { showToast: false }
    );
  }

  private static mapDbAchievementToModel(achievement: any, achievedAt?: string): Achievement {
    const mapped: Achievement = {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      category: mapToAchievementCategory(achievement.category),
      rank: mapToAchievementRank(achievement.rank),
      points: achievement.points,
      xpReward: achievement.xp_reward,
      iconName: achievement.icon_name,
      requirements: achievement.requirements,
      isUnlocked: !!achievedAt,
    };
    
    if (achievedAt) {
      mapped.achievedAt = achievedAt;
    }
    
    return mapped;
  }
}
