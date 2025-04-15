
import { Achievement, AchievementCategory, AchievementRank, UserAchievementData } from '@/types/achievementTypes';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { mapToAchievementCategory, mapToAchievementRank } from '@/types/achievementMappers';

/**
 * Service for fetching achievement lists
 */
export class AchievementListService {
  /**
   * Get all achievements
   */
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Fetch achievements directly from supabase
        const { data: achievementsData, error } = await supabase
          .from('achievements')
          .select('*');
          
        if (error) {
          throw new Error(`Failed to fetch achievements: ${error.message}`);
        }
        
        // Transform the data to match Achievement interface
        const formattedAchievements: Achievement[] = achievementsData.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
          category: mapToAchievementCategory(a.category),
          rank: mapToAchievementRank(a.rank),
          points: a.points,
          xpReward: a.xp_reward,
          iconName: a.icon_name,
          requirements: a.requirements,
          stringId: a.string_id
        }));
          
        return formattedAchievements;
      },
      'GET_ALL_ACHIEVEMENTS',
      { showToast: false }
    );
  }
  
  /**
   * Get unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) {
          return createErrorResponse(
            'User ID is required',
            'User ID is required to fetch unlocked achievements',
            ErrorCategory.VALIDATION
          ).data as Achievement[];
        }
        
        // Query unlocked achievements with joined data
        const { data: userAchievements, error: achievementsError } = await supabase
          .from('user_achievements')
          .select(`
            achievement_id,
            achieved_at,
            achievement:achievement_id (
              id, name, description, category, rank, 
              points, xp_reward, icon_name, requirements, string_id
            )
          `)
          .eq('user_id', userId)
          .order('achieved_at', { ascending: false });
          
        if (achievementsError) {
          throw new Error(`Failed to fetch achievements: ${achievementsError.message}`);
        }
        
        // Transform the data to match Achievement interface
        const formattedAchievements: Achievement[] = (userAchievements as unknown as UserAchievementData[])
          .filter(ua => ua.achievement) // Filter out any null achievements
          .map(ua => ({
            id: ua.achievement.id,
            name: ua.achievement.name,
            description: ua.achievement.description,
            category: mapToAchievementCategory(ua.achievement.category),
            rank: mapToAchievementRank(ua.achievement.rank),
            points: ua.achievement.points,
            xpReward: ua.achievement.xp_reward,
            iconName: ua.achievement.icon_name,
            requirements: ua.achievement.requirements,
            stringId: ua.achievement.string_id,
            isUnlocked: true,
            achievedAt: ua.achieved_at
          }));
          
        return formattedAchievements;
      },
      'GET_UNLOCKED_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
