
import { AchievementCategory } from '@/types/achievementTypes';
import { ServiceResponse, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { ProgressUpdateService } from './progress/ProgressUpdateService';
import { ProgressInitializationService } from './progress/ProgressInitializationService';
import { CategoryProgressService } from './progress/CategoryProgressService';
import { ProgressBatchService } from './progress/ProgressBatchService';

/**
 * Facade service for achievement progress operations
 * Delegates to specialized services
 */
export class AchievementProgressFacade {
  /**
   * Update progress for a specific achievement
   */
  static async updateProgress(
    userId: string,
    achievementId: string,
    currentValue: number,
    targetValue: number,
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    return ProgressUpdateService.updateProgress(userId, achievementId, currentValue, targetValue, isComplete);
  }
  
  /**
   * Update multiple achievement progress values
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
    return ProgressUpdateService.updateMultipleProgressValues(userId, progressUpdates);
  }
  
  /**
   * Initialize progress for one or more achievements
   */
  static async initializeMultipleProgress(
    userId: string,
    achievements: any[]
  ): Promise<ServiceResponse<boolean>> {
    return ProgressInitializationService.initializeMultipleProgress(userId, achievements);
  }
  
  /**
   * Update streak progress for relevant achievements
   */
  static async updateStreakProgress(
    userId: string,
    currentStreak: number
  ): Promise<ServiceResponse<boolean>> {
    const result = await ProgressBatchService.updateStreakProgress(userId, currentStreak);
    return createSuccessResponse(result.success);
  }
  
  /**
   * Update workout count progress for relevant achievements
   */
  static async updateWorkoutCountProgress(
    userId: string,
    workoutCount: number
  ): Promise<ServiceResponse<boolean>> {
    const result = await ProgressBatchService.updateWorkoutCountProgress(userId, workoutCount);
    return createSuccessResponse(result.success);
  }
  
  /**
   * Update personal record progress for relevant achievements
   */
  static async updatePersonalRecordProgress(
    userId: string,
    recordCount: number
  ): Promise<ServiceResponse<boolean>> {
    const result = await ProgressBatchService.updatePersonalRecordProgress(userId, recordCount);
    return createSuccessResponse(result.success);
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
    return CategoryProgressService.batchUpdateByCategory(userId, category, requirementType, currentValue);
  }
}
