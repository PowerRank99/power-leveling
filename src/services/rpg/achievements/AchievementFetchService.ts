
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { Achievement } from '@/types/achievementTypes';
import { AchievementListService } from './fetch/AchievementListService';
import { AchievementStatsService } from './fetch/AchievementStatsService';
import { AchievementProgressFetchService } from './fetch/AchievementProgressFetchService';

/**
 * Facade service for fetching achievement data
 * Delegates to specialized services for specific functionality
 */
export class AchievementFetchService {
  /**
   * Get all achievements
   * Delegates to AchievementListService
   */
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    return AchievementListService.getAllAchievements();
  }
  
  /**
   * Get unlocked achievements for a user
   * Delegates to AchievementListService
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return AchievementListService.getUnlockedAchievements(userId);
  }
  
  /**
   * Get achievement stats for a user
   * Delegates to AchievementStatsService
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<any>> {
    return AchievementStatsService.getAchievementStats(userId);
  }
  
  /**
   * Check for achievements related to workouts
   * Delegates to AchievementStatsService
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<ServiceResponse<any>> {
    return AchievementStatsService.checkWorkoutAchievements(userId, workoutId);
  }
  
  /**
   * Get achievement progress for a user
   * Delegates to AchievementProgressFetchService
   */
  static async getAchievementProgress(userId: string, achievementId: string): Promise<ServiceResponse<any>> {
    return AchievementProgressFetchService.getAchievementProgress(userId, achievementId);
  }
  
  /**
   * Get all achievement progress for a user
   * Delegates to AchievementProgressFetchService
   */
  static async getAllAchievementProgress(userId: string): Promise<ServiceResponse<any>> {
    return AchievementProgressFetchService.getAllAchievementProgress(userId);
  }
  
  /**
   * Create or update achievement progress
   * Delegates to AchievementProgressFetchService
   */
  static async updateAchievementProgress(
    userId: string, 
    achievementId: string, 
    currentValue: number, 
    targetValue: number, 
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    return AchievementProgressFetchService.updateAchievementProgress(
      userId,
      achievementId,
      currentValue,
      targetValue,
      isComplete
    );
  }
}
