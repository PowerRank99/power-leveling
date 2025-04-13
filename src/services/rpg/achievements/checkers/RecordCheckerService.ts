
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { RecordAchievementChecker } from '../RecordAchievementChecker';
import { BaseAchievementService } from './BaseAchievementService';
import type { PersonalRecordData } from '../AchievementCheckerInterface';

/**
 * Service specifically for checking record-related achievements
 */
export class RecordCheckerService extends BaseAchievementService {
  /**
   * Check all achievements related to personal records
   */
  static async checkPersonalRecordAchievements(
    userId: string,
    recordInfo?: PersonalRecordData
  ): Promise<ServiceResponse<void>> {
    return RecordAchievementChecker.checkAchievements(userId, recordInfo);
  }
}
