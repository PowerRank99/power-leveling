
import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';

/**
 * Service for interacting with achievements in the database
 * This service makes the database the single source of truth for achievements
 */
export class AchievementDatabaseService {
  /**
   * Get all achievements from the database
   */
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    try {
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*');
      
      if (error) throw error;
      
      // Transform database achievements to client Achievement objects
      const formattedAchievements: Achievement[] = achievements.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category as AchievementCategory,
        rank: achievement.rank as AchievementRank,
        points: achievement.points,
        xpReward: achievement.xp_reward,
        iconName: achievement.icon_name,
        requirements: achievement.requirements,
        stringId: achievement.string_id
      }));
      
      return createSuccessResponse(formattedAchievements);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      return createErrorResponse(
        'Failed to fetch achievements',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get a specific achievement by its string ID
   */
  static async getAchievementByStringId(stringId: string): Promise<ServiceResponse<Achievement | null>> {
    try {
      if (!stringId) {
        return createErrorResponse(
          'Invalid achievement ID',
          'Achievement ID cannot be empty',
          ErrorCategory.VALIDATION
        );
      }
      
      const { data: achievement, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('string_id', stringId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!achievement) {
        return createSuccessResponse(null);
      }
      
      const formattedAchievement: Achievement = {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category as AchievementCategory,
        rank: achievement.rank as AchievementRank,
        points: achievement.points,
        xpReward: achievement.xp_reward,
        iconName: achievement.icon_name,
        requirements: achievement.requirements,
        stringId: achievement.string_id
      };
      
      return createSuccessResponse(formattedAchievement);
    } catch (error) {
      console.error('Failed to fetch achievement:', error);
      return createErrorResponse(
        'Failed to fetch achievement',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get achievements by category
   */
  static async getAchievementsByCategory(category: AchievementCategory): Promise<ServiceResponse<Achievement[]>> {
    try {
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', category);
      
      if (error) throw error;
      
      const formattedAchievements: Achievement[] = achievements.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category as AchievementCategory,
        rank: achievement.rank as AchievementRank,
        points: achievement.points,
        xpReward: achievement.xp_reward,
        iconName: achievement.icon_name,
        requirements: achievement.requirements,
        stringId: achievement.string_id
      }));
      
      return createSuccessResponse(formattedAchievements);
    } catch (error) {
      console.error('Failed to fetch achievements by category:', error);
      return createErrorResponse(
        'Failed to fetch achievements by category',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get achievements by rank
   */
  static async getAchievementsByRank(rank: AchievementRank): Promise<ServiceResponse<Achievement[]>> {
    try {
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('rank', rank);
      
      if (error) throw error;
      
      const formattedAchievements: Achievement[] = achievements.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category as AchievementCategory,
        rank: achievement.rank as AchievementRank,
        points: achievement.points,
        xpReward: achievement.xp_reward,
        iconName: achievement.icon_name,
        requirements: achievement.requirements,
        stringId: achievement.string_id
      }));
      
      return createSuccessResponse(formattedAchievements);
    } catch (error) {
      console.error('Failed to fetch achievements by rank:', error);
      return createErrorResponse(
        'Failed to fetch achievements by rank',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }
}
