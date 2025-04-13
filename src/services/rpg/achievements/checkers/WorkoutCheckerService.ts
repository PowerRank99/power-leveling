
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { WorkoutAchievementChecker } from '../WorkoutAchievementChecker';
import { BaseAchievementService } from './BaseAchievementService';

/**
 * Service specifically for checking workout-related achievements
 */
export class WorkoutCheckerService extends BaseAchievementService {
  /**
   * Check all achievements relevant to workout completion
   */
  static async checkWorkoutAchievements(userId: string): Promise<ServiceResponse<void>> {
    return WorkoutAchievementChecker.checkAchievements(userId);
  }

  /**
   * Check a user's workout history for achievements
   */
  static async checkWorkoutHistoryAchievements(userId: string): Promise<ServiceResponse<void>> {
    return WorkoutAchievementChecker.checkWorkoutHistoryAchievements(userId);
  }
}
