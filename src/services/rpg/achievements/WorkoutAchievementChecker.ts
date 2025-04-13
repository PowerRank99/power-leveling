
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementChecker } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { TransactionService } from '../../common/TransactionService';
import { AchievementProgressService } from './AchievementProgressService';
import { UserWorkoutStats, UserProfileData } from './AchievementCheckerInterface';

// Import specialized checkers
import { RankEAchievementChecker } from './workout/RankEAchievementChecker';
import { RankDAchievementChecker } from './workout/RankDAchievementChecker';
import { HigherRankAchievementChecker } from './workout/HigherRankAchievementChecker';
import { WorkoutHistoryChecker } from './workout/WorkoutHistoryChecker';
import { WorkoutStatsService } from './workout/WorkoutStatsService';

/**
 * Facade checker for workout-related achievements
 * Delegates to specialized checkers for different rank achievements
 */
export class WorkoutAchievementChecker extends BaseAchievementChecker implements AchievementChecker {
  /**
   * Check all achievements relevant to workout completion
   * Implementation of abstract method from BaseAchievementChecker (static version)
   */
  static async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');

        // Get workout counts and user stats for achievement checks
        const [workoutStats, userProfile] = await Promise.all([
          WorkoutStatsService.getWorkoutStats(userId),
          WorkoutStatsService.getUserProfile(userId)
        ]);

        if (!userProfile) throw new Error('User profile not found');

        // Use executeWithRetry for better reliability in checking achievements
        await TransactionService.executeWithRetry(
          async () => {
            // Update workout count achievement progress using optimized batch function
            if (workoutStats.totalCount > 0) {
              await AchievementProgressService.updateWorkoutCountProgress(userId, workoutStats.totalCount);
            }
            
            // Check different rank achievements using specialized checkers
            await RankEAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
            await RankDAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
            await HigherRankAchievementChecker.checkRankCAchievements(userId, workoutStats, userProfile);
            await HigherRankAchievementChecker.checkHigherRankAchievements(userId, workoutStats, userProfile);
          }, 
          'achievement_checks', 
          3,
          'Failed to check achievements'
        );
      },
      'CHECK_WORKOUT_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Instance method implementation of the abstract method
   * Acts as a bridge to the static method for interface conformance
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return WorkoutAchievementChecker.checkAchievements(userId);
  }

  /**
   * Check workout history achievements
   * Delegated to specialized WorkoutHistoryChecker
   */
  static async checkWorkoutHistoryAchievements(userId: string): Promise<ServiceResponse<void>> {
    return WorkoutHistoryChecker.checkAchievements(userId);
  }
}
