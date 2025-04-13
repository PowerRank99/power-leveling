
import { AchievementProgress, Achievement } from '@/types/achievementTypes';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseProgressService } from './progress/BaseProgressService';
import { ProgressInitializationService } from './progress/ProgressInitializationService';
import { ProgressUpdateService } from './progress/ProgressUpdateService';
import { ProgressBatchService } from './progress/ProgressBatchService';

/**
 * Facade service for handling achievement progress tracking
 * Delegates to specialized services for specific functionality
 */
export class AchievementProgressService {
  /**
   * Get progress for a specific achievement
   */
  static async getProgress(
    userId: string,
    achievementId: string
  ): Promise<ServiceResponse<AchievementProgress | null>> {
    return BaseProgressService.getProgress(userId, achievementId);
  }
  
  /**
   * Get progress for all achievements of a user
   */
  static async getAllProgress(userId: string): Promise<ServiceResponse<Record<string, AchievementProgress>>> {
    return BaseProgressService.getAllProgress(userId);
  }
  
  /**
   * Initialize progress tracking for an achievement
   */
  static async initializeProgress(
    userId: string,
    achievementId: string,
    targetValue: number
  ): Promise<ServiceResponse<AchievementProgress | null>> {
    return ProgressInitializationService.initializeProgress(userId, achievementId, targetValue);
  }
  
  /**
   * Initialize progress for multiple achievements
   */
  static async initializeMultipleProgress(
    userId: string,
    achievements: Achievement[]
  ): Promise<ServiceResponse<void>> {
    return ProgressInitializationService.initializeMultipleProgress(userId, achievements);
  }
  
  /**
   * Update progress for an achievement
   */
  static async updateProgress(
    userId: string,
    achievementId: string,
    newValue: number,
    options: {
      increment?: boolean;
      checkCompletion?: boolean;
    } = { increment: false, checkCompletion: true }
  ): Promise<ServiceResponse<boolean>> {
    return ProgressUpdateService.updateProgress(userId, achievementId, newValue, options);
  }
  
  /**
   * Increment progress for an achievement by a specified amount
   */
  static async incrementProgress(
    userId: string,
    achievementId: string,
    incrementAmount: number = 1
  ): Promise<ServiceResponse<boolean>> {
    return ProgressUpdateService.incrementProgress(userId, achievementId, incrementAmount);
  }
  
  /**
   * Reset progress for an achievement
   */
  static async resetProgress(
    userId: string,
    achievementId: string
  ): Promise<ServiceResponse<boolean>> {
    return ProgressUpdateService.resetProgress(userId, achievementId);
  }
  
  /**
   * Update workout count achievement progress
   */
  static async updateWorkoutCountProgress(
    userId: string, 
    totalCount: number
  ): Promise<ServiceResponse<void>> {
    return ProgressBatchService.updateWorkoutCountProgress(userId, totalCount);
  }
  
  /**
   * Update personal record achievement progress
   */
  static async updatePersonalRecordProgress(
    userId: string, 
    totalCount: number
  ): Promise<ServiceResponse<void>> {
    return ProgressBatchService.updatePersonalRecordProgress(userId, totalCount);
  }
  
  /**
   * Update streak achievement progress
   */
  static async updateStreakProgress(
    userId: string, 
    currentStreak: number
  ): Promise<ServiceResponse<void>> {
    return ProgressBatchService.updateStreakProgress(userId, currentStreak);
  }
}
