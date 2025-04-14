
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { Achievement, AchievementProgress } from '@/types/achievementTypes';
import { AchievementAwardService } from './achievements/services/AchievementAwardService';
import { AchievementFetchService } from './achievements/services/AchievementFetchService';
import { AchievementProcessingService } from './achievements/services/AchievementProcessingService';
import { AchievementProgressService } from './achievements/AchievementProgressService';

/**
 * Facade service for achievement-related operations
 * Delegates to specialized services for specific functionality
 */
export class AchievementService {
  /**
   * Award achievements
   */
  static async awardAchievement(userId: string, achievementId: string): Promise<ServiceResponse<boolean>> {
    return AchievementAwardService.awardAchievement(userId, achievementId);
  }
  
  static async checkAndAwardAchievements(userId: string, achievementIds: string[]): Promise<ServiceResponse<boolean>> {
    return AchievementAwardService.checkAndAwardAchievements(userId, achievementIds);
  }
  
  /**
   * Fetch achievements
   */
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    return AchievementFetchService.getAllAchievements();
  }
  
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return AchievementFetchService.getUnlockedAchievements(userId);
  }
  
  static async getAchievementStats(userId: string): Promise<ServiceResponse<any>> {
    return AchievementFetchService.getAchievementStats(userId);
  }
  
  static async getAchievementProgress(userId: string, achievementId: string): Promise<ServiceResponse<AchievementProgress | null>> {
    return AchievementProgressService.getAchievementProgress(userId, achievementId);
  }
  
  static async getAllAchievementProgress(userId: string): Promise<ServiceResponse<any>> {
    return AchievementFetchService.getAllAchievementProgress(userId);
  }
  
  /**
   * Process achievements
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<ServiceResponse<string[]>> {
    return AchievementProcessingService.checkWorkoutAchievements(userId, workoutId);
  }
  
  /**
   * Update achievement progress
   */
  static async updateMultipleProgressValues(
    userId: string,
    progressUpdates: Array<{
      achievementId: string,
      currentValue: number,
      targetValue: number,
      isComplete: boolean
    }>
  ): Promise<ServiceResponse<boolean>> {
    return AchievementProgressService.updateMultipleProgressValues(userId, progressUpdates);
  }
  
  static async updateAchievementProgress(
    userId: string, 
    achievementId: string, 
    currentValue: number, 
    targetValue: number, 
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    return AchievementProgressService.updateProgress(userId, achievementId, currentValue, targetValue, isComplete);
  }
}
