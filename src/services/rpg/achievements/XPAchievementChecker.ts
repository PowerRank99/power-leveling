
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementChecker } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '../AchievementService';
import { TransactionService } from '../../common/TransactionService';

/**
 * Checker for XP and level milestone achievements
 */
export class XPAchievementChecker extends BaseAchievementChecker implements AchievementChecker {
  /**
   * Check all achievements related to XP milestones
   * Implementation of abstract method from BaseAchievementChecker (static version)
   */
  static async checkAchievements(
    userId: string, 
    totalXP?: number
  ): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');
        
        const awardedAchievements: string[] = [];

        // Get user profile to get current XP if not provided
        let userXP = totalXP;
        let userLevel = 1;
        
        if (!userXP) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('xp, level')
            .eq('id', userId)
            .single();
            
          if (profileError) throw profileError;
          
          userXP = profile?.xp || 0;
          userLevel = profile?.level || 1;
        }

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Award XP milestone achievements
            if (userXP >= 1000) awardedAchievements.push('xp-1000');
            if (userXP >= 5000) awardedAchievements.push('xp-5000');
            if (userXP >= 10000) awardedAchievements.push('xp-10000');
            if (userXP >= 50000) awardedAchievements.push('xp-50000');
            if (userXP >= 100000) awardedAchievements.push('xp-100000');

            // Level milestone achievements
            if (userLevel >= 10) awardedAchievements.push('level-10');
            if (userLevel >= 25) awardedAchievements.push('level-25');
            if (userLevel >= 50) awardedAchievements.push('level-50');
            if (userLevel >= 75) awardedAchievements.push('level-75');
            if (userLevel >= 99) awardedAchievements.push('level-99');
            
            // Check all achievements in batch
            if (awardedAchievements.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, awardedAchievements);
            }
          }, 
          'xp_milestone_achievements', 
          3,
          'Failed to check XP milestone achievements'
        );
        
        return awardedAchievements;
      },
      'CHECK_XP_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Instance method implementation of the abstract method
   * Acts as a bridge to the static method for interface conformance
   */
  async checkAchievements(
    userId: string,
    totalXP?: number
  ): Promise<ServiceResponse<string[]>> {
    return XPAchievementChecker.checkAchievements(userId, totalXP);
  }
}
