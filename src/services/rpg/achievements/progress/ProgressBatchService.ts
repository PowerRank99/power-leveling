
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseProgressService } from './BaseProgressService';
import { WorkoutProgressBatchService } from './WorkoutProgressBatchService';
import { RecordProgressBatchService } from './RecordProgressBatchService';
import { StreakProgressBatchService } from './StreakProgressBatchService';
import { GenericProgressBatchService } from './GenericProgressBatchService';

/**
 * Facade service for batch achievement progress updates
 * Delegates to specialized services for different achievement types
 */
export class ProgressBatchService extends BaseProgressService {
  /**
   * Update workout count achievement progress
   * Delegates to WorkoutProgressBatchService
   */
  static async updateWorkoutCountProgress(
    userId: string, 
    totalCount: number
  ): Promise<ServiceResponse<void>> {
    return WorkoutProgressBatchService.updateWorkoutCountProgress(userId, totalCount);
  }
  
  /**
   * Update personal record achievement progress
   * Delegates to RecordProgressBatchService
   */
  static async updatePersonalRecordProgress(
    userId: string, 
    totalCount: number
  ): Promise<ServiceResponse<void>> {
    return RecordProgressBatchService.updatePersonalRecordProgress(userId, totalCount);
  }
  
  /**
   * Update streak achievement progress
   * Delegates to StreakProgressBatchService
   */
  static async updateStreakProgress(
    userId: string, 
    currentStreak: number
  ): Promise<ServiceResponse<void>> {
    return StreakProgressBatchService.updateStreakProgress(userId, currentStreak);
  }
  
  /**
   * Generic batch update method for achievements
   * Delegates to GenericProgressBatchService
   */
  static async batchUpdateProgress(
    userId: string,
    achievements: Array<{
      achievementId: string,
      currentValue: number,
      targetValue: number,
      isComplete: boolean
    }>
  ): Promise<ServiceResponse<void>> {
    return GenericProgressBatchService.batchUpdateProgress(userId, achievements);
  }
}
