
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { AchievementStats } from '@/types/achievementTypes';

/**
 * Service for fetching achievement statistics
 */
export class AchievementStatsService {
  /**
   * Get achievement stats for a user
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<AchievementStats>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) {
          return createErrorResponse(
            'User ID is required',
            'User ID is required to fetch achievement stats',
            ErrorCategory.VALIDATION
          ).data as AchievementStats;
        }
        
        // Use RPC function to get stats
        const { data: stats, error: statsError } = await supabase
          .rpc('get_achievement_stats', { p_user_id: userId });
          
        if (statsError) {
          throw new Error(`Failed to fetch achievement stats: ${statsError.message}`);
        }
        
        // Get most recently unlocked achievements
        const { data: recentAchievements, error: recentError } = await supabase
          .from('user_achievements')
          .select(`
            achievement_id,
            achieved_at,
            achievements:achievement_id (
              id, name, description, category, rank, 
              points, xp_reward, icon_name, requirements
            )
          `)
          .eq('user_id', userId)
          .order('achieved_at', { ascending: false })
          .limit(5);
          
        if (recentError) {
          throw new Error(`Failed to fetch recent achievements: ${recentError.message}`);
        }
        
        // Transform the recent achievements
        const formattedRecent = recentAchievements
          .filter(ua => ua.achievements) // Filter out any null achievements
          .map(ua => ({
            id: ua.achievements.id,
            name: ua.achievements.name,
            description: ua.achievements.description,
            category: ua.achievements.category,
            rank: ua.achievements.rank as any,
            points: ua.achievements.points,
            xpReward: ua.achievements.xp_reward,
            iconName: ua.achievements.icon_name,
            requirements: ua.achievements.requirements,
            isUnlocked: true,
            achievedAt: ua.achieved_at
          }));
          
        // Combine all stats
        return {
          total: stats.total || 0,
          unlocked: stats.unlocked || 0,
          points: stats.points || 0,
          byRank: {
            'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'Unranked': 0
          }, // Placeholder, would need another query to populate this
          byCategory: {}, // Placeholder, would need another query to populate this
          recentlyUnlocked: formattedRecent
        };
      },
      'GET_ACHIEVEMENT_STATS',
      { showToast: false }
    );
  }
  
  /**
   * Check for achievements related to workouts (placeholder for AchievementFetchService)
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<ServiceResponse<any>> {
    return createSuccessResponse({ count: 0 });
  }
}
