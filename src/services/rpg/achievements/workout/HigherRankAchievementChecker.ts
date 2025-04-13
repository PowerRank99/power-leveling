
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';

/**
 * Checker specifically for higher rank (C, B, A, S) workout achievements
 */
export class HigherRankAchievementChecker {
  /**
   * Check Rank C achievements (intermediate difficulty)
   */
  static async checkRankCAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const achievementChecks: string[] = [];
        
        // 25 total workouts
        if (workoutStats.totalCount >= 25) {
          achievementChecks.push('total-25');
        }
        
        if (achievementChecks.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
        }
      },
      'CHECK_RANK_C_ACHIEVEMENTS',
      { showToast: false }
    );
  }
  
  /**
   * Check higher rank achievements (B, A, S)
   */
  static async checkHigherRankAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const achievementChecks: string[] = [];
        
        // Rank B achievements
        // 50 total workouts
        if (workoutStats.totalCount >= 50) {
          achievementChecks.push('total-50');
        }
        
        // Rank A achievements
        // 100 total workouts
        if (workoutStats.totalCount >= 100) {
          achievementChecks.push('total-100');
        }
        
        // Rank S achievements
        // 200 total workouts
        if (workoutStats.totalCount >= 200) {
          achievementChecks.push('total-200');
        }
        
        // 365-day streak (legendary)
        if (userProfile?.streak >= 365) {
          achievementChecks.push('streak-365');
        }
        
        if (achievementChecks.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
        }
      },
      'CHECK_HIGHER_RANK_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
