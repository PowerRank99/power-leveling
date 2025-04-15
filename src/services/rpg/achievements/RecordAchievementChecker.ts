
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

        // Get PR achievements from database
        const { data: prAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('category', 'record')
          .order('requirements->count', { ascending: true });
          
        if (achievementsError) throw achievementsError;

        // Use transaction service to ensure consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Update PR count achievement progress
            if (prCount && prCount > 0) {
              await AchievementProgressService.updatePersonalRecordProgress(userId, prCount);
            }

            // Check count-based achievements
            prAchievements.forEach(achievement => {
              const requiredCount = achievement.requirements?.count || 0;
              if (prCount && prCount >= requiredCount) {
                awardedAchievements.push(achievement.id);
              }
            });

            // Check for impressive PR achievements based on weight increase percentage
            if (normalizedRecordInfo && normalizedRecordInfo.previousWeight > 0) {
              const increasePercentage = ((normalizedRecordInfo.weight - normalizedRecordInfo.previousWeight) / normalizedRecordInfo.previousWeight) * 100;
              
              // Get percentage-based PR achievements
              const { data: percentageAchievements } = await supabase
                .from('achievements')
                .select('id, requirements')
                .eq('category', 'record_percentage')
                .order('requirements->percentage', { ascending: true });
              
              if (percentageAchievements) {
                percentageAchievements.forEach(achievement => {
                  const requiredPercentage = achievement.requirements?.percentage || 0;
                  if (increasePercentage >= requiredPercentage) {
                    awardedAchievements.push(achievement.id);
                  }
                });
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
   */
  async checkAchievements(
    userId: string,
    recordInfo?: PersonalRecordData
  ): Promise<ServiceResponse<string[]>> {
    return RecordAchievementChecker.checkAchievements(userId, recordInfo);
  }
}
