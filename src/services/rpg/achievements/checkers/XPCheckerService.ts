
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { XPAchievementChecker } from '../XPAchievementChecker';
import { BaseAchievementService } from './BaseAchievementService';

/**
 * Service specifically for checking XP-related achievements
 */
export class XPCheckerService extends BaseAchievementService {
  /**
   * Check all achievements related to XP milestones
   */
  static async checkXPMilestoneAchievements(
    userId: string, 
    totalXP?: number
  ): Promise<ServiceResponse<void>> {
    return XPAchievementChecker.checkAchievements(userId, totalXP);
  }
}
