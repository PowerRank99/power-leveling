import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createSuccessResponse, createErrorResponse } from '@/services/common/ErrorHandlingService';

/**
 * Service for fetching achievements from the database
 */
export class AchievementFetchService {
  /**
   * Get all achievements
   */
  static async getAllAchievements(): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank');
      
      if (error) {
        console.error("Error fetching achievements:", error);
        return createErrorResponse(error.message);
      }
      
      if (!data || data.length === 0) {
        return createSuccessResponse([]);
      }
      
      // Format the achievements data
      const formattedAchievements = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        rank: item.rank,
        points: item.points,
        xp_reward: item.xp_reward,
        icon_name: item.icon_name,
        requirements: item.requirements
      }));
      
      return createSuccessResponse(formattedAchievements);
    } catch (error: any) {
      console.error("Exception fetching achievements:", error);
      return createErrorResponse(error.message);
    }
  }
  
  /**
   * Get a specific achievement by ID
   */
  static async getAchievementById(achievementId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();
      
      if (error) {
        console.error(`Error fetching achievement with ID ${achievementId}:`, error);
        return createErrorResponse(error.message);
      }
      
      if (!data) {
        return createErrorResponse(`Achievement with ID ${achievementId} not found`);
      }
      
      // Format the achievement data
      const formattedAchievement = {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        rank: data.rank,
        points: data.points,
        xp_reward: data.xp_reward,
        icon_name: data.icon_name,
        requirements: data.requirements
      };
      
      return createSuccessResponse(formattedAchievement);
    } catch (error: any) {
      console.error(`Exception fetching achievement with ID ${achievementId}:`, error);
      return createErrorResponse(error.message);
    }
  }
  
  /**
   * Get achievements by category
   */
  static async getAchievementsByCategory(category: string): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', category)
        .order('rank');
      
      if (error) {
        console.error(`Error fetching achievements for category ${category}:`, error);
        return createErrorResponse(error.message);
      }
      
      if (!data || data.length === 0) {
        return createSuccessResponse([]);
      }
      
      // Format the achievements data
      const formattedAchievements = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        rank: item.rank,
        points: item.points,
        xp_reward: item.xp_reward,
        icon_name: item.icon_name,
        requirements: item.requirements
      }));
      
      return createSuccessResponse(formattedAchievements);
    } catch (error: any) {
      console.error(`Exception fetching achievements for category ${category}:`, error);
      return createErrorResponse(error.message);
    }
  }
}
