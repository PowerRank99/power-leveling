
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Repository for database operations related to achievements
 */
export class AchievementRepository {
  /**
   * Get all achievements from the database
   */
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank', { ascending: true })
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch achievements',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get achievement by UUID
   */
  static async getAchievementById(achievementId: string): Promise<ServiceResponse<Achievement | null>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .maybeSingle();
        
      if (error) throw error;
      
      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch achievement',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get achievement by string ID
   */
  static async getAchievementByStringId(stringId: string): Promise<ServiceResponse<Achievement | null>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('string_id', stringId)
        .maybeSingle();
        
      if (error) throw error;
      
      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch achievement by string ID',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
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
          achievements (*)
        `)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Format the data to match the Achievement type
      const achievements = data.map((item: any) => ({
        ...item.achievements,
        achieved_at: item.achieved_at
      }));
      
      return createSuccessResponse(achievements);
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch unlocked achievements',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
}
