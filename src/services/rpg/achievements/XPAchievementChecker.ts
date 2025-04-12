
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
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
   */
  static async checkAchievements(
    userId: string, 
    totalXP?: number
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

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
            const achievementChecks = [];
            
            if (userXP >= 1000) achievementChecks.push('xp-1000');
            if (userXP >= 5000) achievementChecks.push('xp-5000');
            if (userXP >= 10000) achievementChecks.push('xp-10000');
            if (userXP >= 50000) achievementChecks.push('xp-50000');
            if (userXP >= 100000) achievementChecks.push('xp-100000');

            // Level milestone achievements
            if (userLevel >= 10) achievementChecks.push('level-10');
            if (userLevel >= 25) achievementChecks.push('level-25');
            if (userLevel >= 50) achievementChecks.push('level-50');
            if (userLevel >= 75) achievementChecks.push('level-75');
            if (userLevel >= 99) achievementChecks.push('level-99');
            
            // Check all achievements in batch
            if (achievementChecks.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
            }
          }, 
          'xp_milestone_achievements', 
          3,
          'Failed to check XP milestone achievements'
        );
      },
      'CHECK_XP_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
