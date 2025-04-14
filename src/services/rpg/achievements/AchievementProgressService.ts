
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { AchievementCategory } from '@/types/achievementTypes';
import { Achievement, AchievementProgress } from '@/types/achievementTypes';
import { AchievementProgressFacade } from './AchievementProgressFacade';
import { ProgressBaseService } from './progress/ProgressBaseService';

/**
 * Service for handling achievement progress updates
 * Acts as a thin facade to more specialized services
 */
export class AchievementProgressService {
  /**
   * Update achievement progress for a specific achievement
   */
  static async updateProgress(
    userId: string,
    achievementId: string,
    currentValue: number,
    targetValue: number,
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    return AchievementProgressFacade.updateProgress(userId, achievementId, currentValue, targetValue, isComplete);
  }
  
  /**
   * Initialize progress for one or more achievements
   */
  static async initializeMultipleProgress(
    userId: string,
    achievements: Achievement[]
  ): Promise<ServiceResponse<boolean>> {
    return AchievementProgressFacade.initializeMultipleProgress(userId, achievements);
  }
  
  /**
   * Update multiple achievement progress values in a single operation
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
    return AchievementProgressFacade.updateMultipleProgressValues(userId, progressUpdates);
  }
  
  /**
   * Update streak progress for relevant achievements
   */
  static async updateStreakProgress(
    userId: string,
    currentStreak: number
  ): Promise<ServiceResponse<boolean>> {
    return AchievementProgressFacade.updateStreakProgress(userId, currentStreak);
  }
  
  /**
   * Update workout count progress for relevant achievements
   */
  static async updateWorkoutCountProgress(
    userId: string,
    workoutCount: number
  ): Promise<ServiceResponse<boolean>> {
    return AchievementProgressFacade.updateWorkoutCountProgress(userId, workoutCount);
  }
  
  /**
   * Update personal record progress for relevant achievements
   */
  static async updatePersonalRecordProgress(
    userId: string,
    recordCount: number
  ): Promise<ServiceResponse<boolean>> {
    return AchievementProgressFacade.updatePersonalRecordProgress(userId, recordCount);
  }
  
  /**
   * Batch update progress for achievements by category
   */
  static async batchUpdateByCategory(
    userId: string,
    category: AchievementCategory,
    requirementType: string,
    currentValue: number
  ): Promise<ServiceResponse<boolean>> {
    return AchievementProgressFacade.batchUpdateByCategory(userId, category, requirementType, currentValue);
  }
  
  /**
   * Get progress for a specific achievement
   * This delegates to the ProgressBaseService directly
   */
  static async getAchievementProgress(
    userId: string,
    achievementId: string
  ): Promise<ServiceResponse<AchievementProgress | null>> {
    return ProgressBaseService.getProgress(userId, achievementId);
  }
}
