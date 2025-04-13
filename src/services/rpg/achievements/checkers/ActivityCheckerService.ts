
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { ActivityAchievementChecker } from '../ActivityAchievementChecker';
import { BaseAchievementService } from './BaseAchievementService';

/**
 * Service specifically for checking activity-related achievements
 */
export class ActivityCheckerService extends BaseAchievementService {
  /**
   * Check activity variety achievements
   */
  static async checkActivityVarietyAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ActivityAchievementChecker.checkAchievements(userId);
  }

  /**
   * Check for manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ActivityAchievementChecker.checkManualWorkoutAchievements(userId);
  }
}
