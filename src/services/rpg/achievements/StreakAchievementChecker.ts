
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementChecker } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { TransactionService } from '../../common/TransactionService';
import { AchievementProgressService } from './AchievementProgressService';
import { AchievementService } from '../AchievementService';

/**
 * Checker for streak-related achievements
 */
export class StreakAchievementChecker extends BaseAchievementChecker implements AchievementChecker {
  /**
   * Check all achievements related to streaks
   * Implementation of abstract method from BaseAchievementChecker (static version)
   */
  static async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');
        
        const awardedAchievements: string[] = [];

        // Get user's current streak
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('streak')
          .eq('id', userId)
          .single();
        
        if (profileError) throw profileError;

        const currentStreak = profile?.streak || 0;

        // Define achievements to check based on streak count
        if (currentStreak >= 3) awardedAchievements.push('streak-3');
        if (currentStreak >= 7) awardedAchievements.push('streak-7');
        if (currentStreak >= 14) awardedAchievements.push('streak-14');
        if (currentStreak >= 30) awardedAchievements.push('streak-30');
        if (currentStreak >= 60) awardedAchievements.push('streak-60');
        if (currentStreak >= 100) awardedAchievements.push('streak-100');
        if (currentStreak >= 365) awardedAchievements.push('streak-365');

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Update streak achievement progress
            if (currentStreak > 0) {
              await AchievementProgressService.updateStreakProgress(userId, currentStreak);
            }
            
            // Award achievements
            if (awardedAchievements.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, awardedAchievements);
            }
          }, 
          'streak_achievements', 
          3,
          'Failed to check streak achievements'
        );
        
        return awardedAchievements;
      },
      'CHECK_STREAK_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Instance method implementation of the abstract method
   * Acts as a bridge to the static method for interface conformance
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return StreakAchievementChecker.checkAchievements(userId);
  }
}
