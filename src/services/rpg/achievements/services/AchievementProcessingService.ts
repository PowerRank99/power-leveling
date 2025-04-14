
import { ServiceResponse, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { StandardizedAchievementService } from '../StandardizedAchievementService';

/**
 * Service for processing achievement-related events
 */
export class AchievementProcessingService {
  /**
   * Check for achievements related to workouts
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<ServiceResponse<string[]>> {
    // Check workout achievements
    const workoutAchievementsResult = await StandardizedAchievementService.checkWorkoutAchievements(userId);
    
    // Check streak achievements
    const streakAchievementsResult = await StandardizedAchievementService.checkStreakAchievements(userId);
    
    // Combine results
    const combinedAchievements = [
      ...(workoutAchievementsResult.success && workoutAchievementsResult.data ? workoutAchievementsResult.data : []),
      ...(streakAchievementsResult.success && streakAchievementsResult.data ? streakAchievementsResult.data : [])
    ];
    
    return createSuccessResponse(combinedAchievements);
  }
}
