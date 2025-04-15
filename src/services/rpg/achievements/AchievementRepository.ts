
import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementProgress } from '@/types/achievementTypes';
import { mapDbAchievementToModel } from '@/utils/achievementMappers';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';

/**
 * Repository for direct database operations related to achievements
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
        .order('rank', { ascending: false })
        .order('points', { ascending: false });
        
      if (error) throw error;
      
      const achievements = data.map(mapDbAchievementToModel);
      return createSuccessResponse(achievements);
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch achievements',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get a single achievement by ID
   */
  static async getAchievementById(id: string): Promise<ServiceResponse<Achievement | null>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) throw error;
      
      return createSuccessResponse(data ? mapDbAchievementToModel(data) : null);
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch achievement',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get a single achievement by string ID
   */
  static async getAchievementByStringId(stringId: string): Promise<ServiceResponse<Achievement | null>> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('string_id', stringId)
        .maybeSingle();
        
      if (error) throw error;
      
      return createSuccessResponse(data ? mapDbAchievementToModel(data) : null);
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch achievement by string ID',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get all unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          achieved_at,
          achievements:achievement_id (*)
        `)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      const achievements = data
        .filter(item => item.achievements)
        .map(item => {
          const achievement = mapDbAchievementToModel(item.achievements);
          return {
            ...achievement,
            isUnlocked: true,
            achievedAt: item.achieved_at
          };
        });
        
      return createSuccessResponse(achievements);
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch unlocked achievements',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Check if a user has unlocked an achievement
   */
  static async hasUnlockedAchievement(userId: string, achievementId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { count, error } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('achievement_id', achievementId);
        
      if (error) throw error;
      
      return createSuccessResponse(count !== null && count > 0);
    } catch (error) {
      return createErrorResponse(
        'Failed to check achievement status',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get achievement progress for a user
   */
  static async getAchievementProgress(
    userId: string, 
    achievementId: string
  ): Promise<ServiceResponse<AchievementProgress | null>> {
    try {
      const { data, error } = await supabase
        .from('achievement_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (!data) return createSuccessResponse(null);
      
      const progress: AchievementProgress = {
        id: data.id,
        current: data.current_value,
        total: data.target_value,
        isComplete: data.is_complete
      };
      
      return createSuccessResponse(progress);
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch achievement progress',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Update achievement progress for a user
   */
  static async updateAchievementProgress(
    userId: string,
    achievementId: string,
    currentValue: number,
    targetValue: number,
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('achievement_progress')
        .upsert({
          user_id: userId,
          achievement_id: achievementId,
          current_value: currentValue,
          target_value: targetValue,
          is_complete: isComplete,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,achievement_id'
        });
        
      if (error) throw error;
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to update achievement progress',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
}
