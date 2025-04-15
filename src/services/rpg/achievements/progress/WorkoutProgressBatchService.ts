
import { ServiceResponse, createSuccessResponse, createErrorResponse } from '@/services/common/ErrorHandlingService';
import { AchievementProgressService } from '../AchievementProgressService';
import { AchievementCategory } from '@/types/achievementTypes';
import { AsyncAchievementAdapter } from './AsyncAchievementAdapter';

/**
 * Service for updating workout-related achievement progress in batches
 */
export class WorkoutProgressBatchService {
  /**
   * Update progress for all workout-related achievements
   */
  static async updateAllWorkoutProgress(
    userId: string,
    workoutCount: number = 0,
    streakDays: number = 0
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Get all workout-related achievements
      const workoutAchievements = await AsyncAchievementAdapter.filterAchievements(
        a => a.category === AchievementCategory.WORKOUT
      );
      
      // Prepare progress updates
      const progressUpdates = workoutAchievements.map(achievement => {
        const requirementValue = achievement.requirements?.value || 1;
        const isComplete = workoutCount >= requirementValue;
        
        return {
          achievementId: achievement.id,
          currentValue: Math.min(workoutCount, requirementValue),
          targetValue: requirementValue,
          isComplete
        };
      });
      
      // Update progress in a batch
      if (progressUpdates.length > 0) {
        await AchievementProgressService.updateMultipleProgressValues(userId, progressUpdates);
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to update workout achievement progress',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}
