
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { Achievement, UserAchievementData } from '@/types/achievementTypes';
import { AchievementDatabaseService } from '@/services/common/AchievementDatabaseService';

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
        // Use the database service to fetch achievements
        const response = await AchievementDatabaseService.getAllAchievements();
        
        if (!response.success) {
          throw new Error(response.message);
        }
        
        return response.data;
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
            achievements:achievement_id (
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
            stringId: ua.achievements.string_id,
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
