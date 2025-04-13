
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { StreakAchievementChecker } from '../StreakAchievementChecker';
import { BaseAchievementService } from './BaseAchievementService';

/**
 * Service specifically for checking streak-related achievements
 */
export class StreakCheckerService extends BaseAchievementService {
  /**
   * Check all achievements related to streaks
   */
  static async checkStreakAchievements(userId: string): Promise<ServiceResponse<void>> {
    return StreakAchievementChecker.checkAchievements(userId);
  }
}
