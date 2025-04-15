
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';

/**
 * Service for checking manual workout related achievements
 */
export class ManualWorkoutChecker {
  /**
   * Checks achievements related to manual workouts
   * @param userId The user id to check achievements for
   * @returns ServiceResponse with awarded achievement IDs
   */
  static async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    try {
      // Count manual workouts for the user
      const { data, error, count } = await supabase
        .from('manual_workouts')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Get manual workout achievements from database
      const { data: manualAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('id, requirements')
        .eq('category', 'manual')
        .order('requirements->count', { ascending: true });
        
      if (achievementsError) {
        throw achievementsError;
      }

      // Initialize array to track awarded achievements
      const achievementsToCheck: string[] = [];

      // Check each achievement's requirements
      manualAchievements.forEach(achievement => {
        const requiredCount = achievement.requirements?.count || 0;
        if (count && count >= requiredCount) {
          achievementsToCheck.push(achievement.id);
        }
      });

      // Award achievements (if any)
      if (achievementsToCheck.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
      }

      return createSuccessResponse(achievementsToCheck);
    } catch (error) {
      return createErrorResponse(
        'Failed to check manual workout achievements',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.BUSINESS_LOGIC
      );
    }
  }
}
