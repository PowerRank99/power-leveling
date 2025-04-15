
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
  ): Promise<ServiceResponse<string[]>> {
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

        // Get XP achievements from database
        const { data: xpAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('category', 'xp')
          .order('requirements->value', { ascending: true });
          
        if (achievementsError) throw achievementsError;

        // Get level achievements from database
        const { data: levelAchievements, error: levelError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('category', 'level')
          .order('requirements->level', { ascending: true });
          
        if (levelError) throw levelError;

        const awardedAchievements: string[] = [];

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Award XP milestone achievements
            if (xpAchievements) {
              xpAchievements.forEach(achievement => {
                const requiredXP = achievement.requirements?.value || 0;
                if (userXP && userXP >= requiredXP) {
                  awardedAchievements.push(achievement.id);
                }
              });
            }

            // Award level milestone achievements
            if (levelAchievements) {
              levelAchievements.forEach(achievement => {
                const requiredLevel = achievement.requirements?.level || 0;
                if (userLevel >= requiredLevel) {
                  awardedAchievements.push(achievement.id);
                }
              });
            }
            
            // Check achievements in batch
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
   */
  async checkAchievements(
    userId: string,
    totalXP?: number
  ): Promise<ServiceResponse<string[]>> {
    return XPAchievementChecker.checkAchievements(userId, totalXP);
  }
}
