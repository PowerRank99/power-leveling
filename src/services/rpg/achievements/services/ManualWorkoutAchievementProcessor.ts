
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementCategory } from '@/types/achievementTypes';
import { AsyncAchievementAdapter } from '../progress/AsyncAchievementAdapter';

/**
 * Service for processing manual workout related achievements
 */
export class ManualWorkoutAchievementProcessor {
  /**
   * Process manual workout for achievements
   */
  static async processManualWorkout(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get user manual workout count
        // We'll just use a placeholder value for now since the WorkoutService doesn't exist
        const manualWorkoutCount = 1; // Placeholder
        
        // Get relevant achievements
        const manualAchievements = await AsyncAchievementAdapter.filterAchievements(
          a => a.category === AchievementCategory.MANUAL
        );
        
        // Filter achievements based on manual workout count
        const unlockedAchievementIds = manualAchievements
          .filter(achievement => manualWorkoutCount >= (achievement.requirements?.value || 0))
          .map(achievement => achievement.id);
        
        return unlockedAchievementIds;
      },
      'PROCESS_MANUAL_WORKOUT',
      { showToast: false }
    );
  }
  
  /**
   * Check manual workout achievements (legacy method)
   */
  static async checkManualAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.processManualWorkout(userId);
  }
}
