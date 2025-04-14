
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { Achievement, UserAchievementData, AchievementRank, AchievementCategory } from '@/types/achievementTypes';
import { BaseAchievementFetchService } from './BaseAchievementFetchService';

/**
 * Service for fetching achievement lists
 */
export class AchievementListService extends BaseAchievementFetchService {
  /**
   * Get all achievements
   */
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank');
        
      if (error) {
        return this.handleQueryError(error, 'fetch achievements');
      }
      
      // Transform the data to match our Achievement interface
      const achievements = data?.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category as AchievementCategory,
        rank: achievement.rank as AchievementRank,
        points: achievement.points,
        xpReward: achievement.xp_reward,
        iconName: achievement.icon_name,
        requirements: achievement.requirements,
        isUnlocked: false
      })) as Achievement[] || [];
      
      return createSuccessResponse(achievements);
    } catch (error) {
      return this.handleException(error, 'fetching achievements');
    }
  }
  
  /**
   * Get unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          achieved_at,
          achievements:achievement_id (
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
        
      if (error) {
        return this.handleQueryError(error, 'fetch unlocked achievements');
      }
      
      // Explicit type casting and safe transformation
      const castData = data as unknown as UserAchievementData[];
      const achievements = castData?.map(item => ({
        id: item.achievement_id,
        name: item.achievements.name,
        description: item.achievements.description,
        category: item.achievements.category as AchievementCategory,
        rank: item.achievements.rank as AchievementRank,
        points: item.achievements.points,
        xpReward: item.achievements.xp_reward,
        iconName: item.achievements.icon_name,
        requirements: item.achievements.requirements,
        isUnlocked: true,
        achievedAt: item.achieved_at
      })) as Achievement[] || [];
      
      return createSuccessResponse(achievements);
    } catch (error) {
      return this.handleException(error, 'fetching unlocked achievements');
    }
  }
}
