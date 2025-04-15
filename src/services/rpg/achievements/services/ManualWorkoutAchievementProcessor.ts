import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementCategory } from '@/types/achievementTypes';
import { ManualWorkoutService } from '@/services/WorkoutService';
import { UserService } from '@/services/UserService';
import { AsyncAchievementAdapter } from '../progress/AsyncAchievementAdapter';

/**
 * Service for processing manual workout related achievements
 */
export class ManualWorkoutAchievementProcessor {
  /**
   * Check manual workout achievements
   */
  static async checkManualAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get user data
        const userResponse = await UserService.getUserById(userId);
        if (!userResponse.success || !userResponse.data) {
          throw new Error(`User not found: ${userId}`);
        }
        
        // Get manual workout count
        const manualWorkouts = await ManualWorkoutService.getManualWorkoutsByUserId(userId);
        const manualWorkoutCount = manualWorkouts.length;
        
        // Get relevant achievements
        const manualAchievements = await AsyncAchievementAdapter.filterAchievements(
          a => a.category === AchievementCategory.MANUAL
        );
        
        // Filter achievements based on manual workout count
        const unlockedAchievementIds = manualAchievements
          .filter(achievement => manualWorkoutCount >= achievement.requirements.value)
          .map(achievement => achievement.id);
        
        return unlockedAchievementIds;
      },
      'CHECK_MANUAL_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
