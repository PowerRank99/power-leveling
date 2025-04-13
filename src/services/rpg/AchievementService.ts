
import { Achievement, AchievementStats } from '@/types/achievementTypes';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { AchievementFetchService } from './achievements/AchievementFetchService';
import { AchievementAwardService } from './achievements/AchievementAwardService';
import { AchievementInitializationService } from './achievements/AchievementInitializationService';
import { AchievementVerificationService } from './achievements/AchievementVerificationService';

/**
 * Facade service for managing achievements
 * Delegates to specialized services for specific functionality
 */
export class AchievementService {
  /**
   * Get all achievements for a user
   */
  static async getAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return AchievementFetchService.getAchievements(userId);
  }

  /**
   * Get only unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return AchievementFetchService.getUnlockedAchievements(userId);
  }

  /**
   * Get achievement statistics for a user
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<AchievementStats>> {
    return AchievementFetchService.getAchievementStats(userId);
  }

  /**
   * Award an achievement to a user
   */
  static async awardAchievement(
    userId: string, 
    achievementId: string
  ): Promise<ServiceResponse<boolean>> {
    return AchievementAwardService.awardAchievement(userId, achievementId);
  }

  /**
   * Check and award multiple achievements
   */
  static async checkAndAwardAchievements(
    userId: string, 
    achievementIds: string[]
  ): Promise<ServiceResponse<{ successful: string[], failed: string[] }>> {
    return AchievementAwardService.checkAndAwardAchievements(userId, achievementIds);
  }

  /**
   * Check workout achievements
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<ServiceResponse<void>> {
    return AchievementVerificationService.checkWorkoutAchievements(userId, workoutId);
  }

  /**
   * Initialize progress tracking for incremental achievements
   */
  static async initializeAchievementProgress(userId: string): Promise<ServiceResponse<void>> {
    return AchievementInitializationService.initializeAchievementProgress(userId);
  }
}
