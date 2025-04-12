
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementChecker } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { TransactionService } from '../../common/TransactionService';
import { AchievementProgressService } from './AchievementProgressService';

/**
 * Checker for streak-related achievements
 */
export class StreakAchievementChecker extends BaseAchievementChecker implements AchievementChecker {
  /**
   * Check all achievements related to streaks
   * Implementation of abstract method from BaseAchievementChecker (static version)
   */
  static async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Get user's current streak
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('streak')
          .eq('id', userId)
          .single();
        
        if (profileError) throw profileError;

        const currentStreak = profile?.streak || 0;

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Update streak achievement progress using optimized batch function
            if (currentStreak > 0) {
              await AchievementProgressService.updateStreakProgress(userId, currentStreak);
            }
          }, 
          'streak_achievements', 
          3,
          'Failed to check streak achievements'
        );
      },
      'CHECK_STREAK_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Instance method implementation of the abstract method
   * Acts as a bridge to the static method for interface conformance
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return StreakAchievementChecker.checkAchievements(userId);
  }
}
