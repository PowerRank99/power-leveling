
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementChecker, PersonalRecordData } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '../AchievementService';
import { TransactionService } from '../../common/TransactionService';
import { AchievementProgressService } from './AchievementProgressService';

/**
 * Checker for personal record related achievements
 */
export class RecordAchievementChecker extends BaseAchievementChecker implements AchievementChecker {
  /**
   * Check all achievements related to personal records
   * Implementation of abstract method from BaseAchievementChecker (static version)
   */
  static async checkAchievements(
    userId: string,
    recordInfo?: PersonalRecordData
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Get total PR count
        const { count: prCount, error: prError } = await supabase
          .from('personal_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (prError) throw prError;

        // Use transaction service to ensure consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Update PR count achievement progress using optimized batch function
            if (prCount && prCount > 0) {
              await AchievementProgressService.updatePersonalRecordProgress(userId, prCount);
            }

            // Check for impressive PR achievements based on weight increase percentage
            if (recordInfo && recordInfo.previousWeight > 0) {
              const increasePercentage = ((recordInfo.weight - recordInfo.previousWeight) / recordInfo.previousWeight) * 100;
              
              if (increasePercentage >= 10) {
                await AchievementService.awardAchievement(userId, 'pr-increase-10');
              }
              if (increasePercentage >= 20) {
                await AchievementService.awardAchievement(userId, 'pr-increase-20');
              }
            }
          }, 
          'personal_record_achievements', 
          3,
          'Failed to check personal record achievements'
        );
      },
      'CHECK_PR_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Instance method implementation of the abstract method
   * Acts as a bridge to the static method for interface conformance
   */
  async checkAchievements(
    userId: string,
    recordInfo?: PersonalRecordData
  ): Promise<ServiceResponse<void>> {
    return RecordAchievementChecker.checkAchievements(userId, recordInfo);
  }
}
