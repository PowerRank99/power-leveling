
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementChecker, PersonalRecordData } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '../AchievementService';
import { TransactionService } from '../../common/TransactionService';
import { AchievementProgressService } from './AchievementProgressService';
import { normalizePersonalRecord } from '@/utils/caseConversions';

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
  ): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');
        
        const awardedAchievements: string[] = [];

        // Ensure consistent property names by normalizing the record info
        const normalizedRecordInfo = recordInfo ? normalizePersonalRecord(recordInfo) : undefined;

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

            // Check count-based achievements
            if (prCount && prCount >= 1) awardedAchievements.push('pr-first');
            if (prCount && prCount >= 5) awardedAchievements.push('pr-5');
            if (prCount && prCount >= 10) awardedAchievements.push('pr-10');
            if (prCount && prCount >= 25) awardedAchievements.push('pr-25');
            if (prCount && prCount >= 50) awardedAchievements.push('pr-50');

            // Check for impressive PR achievements based on weight increase percentage
            if (normalizedRecordInfo && normalizedRecordInfo.previousWeight > 0) {
              const increasePercentage = ((normalizedRecordInfo.weight - normalizedRecordInfo.previousWeight) / normalizedRecordInfo.previousWeight) * 100;
              
              if (increasePercentage >= 10) {
                awardedAchievements.push('pr-increase-10');
              }
              if (increasePercentage >= 20) {
                awardedAchievements.push('pr-increase-20');
              }
            }
            
            // Award achievements
            if (awardedAchievements.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, awardedAchievements);
            }
          }, 
          'personal_record_achievements', 
          3,
          'Failed to check personal record achievements'
        );
        
        return awardedAchievements;
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
  ): Promise<ServiceResponse<string[]>> {
    return RecordAchievementChecker.checkAchievements(userId, recordInfo);
  }
}
