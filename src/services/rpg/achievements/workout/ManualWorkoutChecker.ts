
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';
import { ServiceResponse, createSuccessResponse, createErrorResponse } from '@/services/common/ErrorHandlingService';
import { ACHIEVEMENT_IDS } from '../AchievementConstants';

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

      // Initialize array to track awarded achievements
      const achievementsToCheck: string[] = [];

      // Check for "Diário do Suor" achievement (3 manual workouts)
      if (count && count >= 3) {
        achievementsToCheck.push(ACHIEVEMENT_IDS.E.manual[0]); // diario-do-suor
      }

      // Award achievements (if any)
      if (achievementsToCheck.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
      }

      return createSuccessResponse(achievementsToCheck);
    } catch (error) {
      return createErrorResponse(
        'Failed to check manual workout achievements',
        error instanceof Error ? error.message : String(error),
        'ACHIEVEMENT_MANUAL_WORKOUT_CHECK'
      );
    }
  }
}
