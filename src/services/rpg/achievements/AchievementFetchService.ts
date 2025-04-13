
import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementStats } from '@/types/achievementTypes';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';

/**
 * Service for fetching achievements data
 */
export class AchievementFetchService {
  /**
   * Get all achievements for a user
   */
  static async getAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get all achievements
        const { data: achievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('rank', { ascending: false });

        if (achievementsError) throw achievementsError;

        // Get user's unlocked achievements
        const { data: userAchievements, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('achievement_id, achieved_at')
          .eq('user_id', userId);

        if (userAchievementsError) throw userAchievementsError;

        // Get achievement progress data
        const { data: progressMap, error: progressError } = await supabase
          .rpc('get_all_achievement_progress', { p_user_id: userId });
          
        if (progressError) throw progressError;

        // Map and merge the data
        const achievementsWithStatus: Achievement[] = achievements.map(achievement => {
          const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
          const parsedRequirements = typeof achievement.requirements === 'string' 
            ? JSON.parse(achievement.requirements as string) 
            : achievement.requirements;
            
          // Get progress for this achievement
          const progressData = progressMap && progressMap[achievement.id];
          const progress = progressData ? {
            id: progressData.id,
            current: progressData.current,
            total: progressData.total,
            isComplete: progressData.isComplete
          } : undefined;

          return {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            category: achievement.category,
            rank: achievement.rank,
            points: achievement.points,
            xpReward: achievement.xp_reward,
            iconName: achievement.icon_name,
            requirements: parsedRequirements as Record<string, any>,
            isUnlocked: !!userAchievement,
            achievedAt: userAchievement?.achieved_at,
            progress
          };
        });

        return achievementsWithStatus;
      },
      'GET_ACHIEVEMENTS'
    );
  }

  /**
   * Get only unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get user's unlocked achievements with their details
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
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
        if (!data) return [];

        // Map the data to our Achievement type
        const achievements: Achievement[] = data.map(item => {
          if (!item.achievements) return null;
          
          const parsedRequirements = typeof item.achievements.requirements === 'string' 
            ? JSON.parse(item.achievements.requirements as string) 
            : item.achievements.requirements;

          return {
            id: item.achievements.id,
            name: item.achievements.name,
            description: item.achievements.description,
            category: item.achievements.category,
            rank: item.achievements.rank,
            points: item.achievements.points,
            xpReward: item.achievements.xp_reward,
            iconName: item.achievements.icon_name,
            requirements: parsedRequirements as Record<string, any>,
            isUnlocked: true,
            achievedAt: item.achieved_at
          };
        }).filter(Boolean) as Achievement[];

        return achievements;
      },
      'GET_UNLOCKED_ACHIEVEMENTS'
    );
  }

  /**
   * Get achievement statistics for a user
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<AchievementStats>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Use the optimized stored procedure for stats
        const { data, error } = await supabase
          .rpc('get_achievement_stats', { p_user_id: userId });
          
        if (error) throw error;
        
        if (!data) {
          return {
            total: 0,
            unlocked: 0,
            points: 0,
            rank: 'Unranked',
            nextRank: 'E',
            pointsToNextRank: 10
          };
        }
        
        // Type assertion to handle complex JSON response
        const statsData = data as {
          total: number;
          unlocked: number;
          points: number;
          rank: string;
          nextRank: string;
          pointsToNextRank: number;
        };
        
        return {
          total: statsData.total || 0,
          unlocked: statsData.unlocked || 0,
          points: statsData.points || 0,
          rank: statsData.rank || 'Unranked',
          nextRank: statsData.nextRank,
          pointsToNextRank: statsData.pointsToNextRank
        };
      },
      'GET_ACHIEVEMENT_STATS'
    );
  }
}
