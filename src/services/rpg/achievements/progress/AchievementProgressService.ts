
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { ProgressBaseService } from './ProgressBaseService';
import { ProgressUpdateService } from './ProgressUpdateService';
import { ProgressInitializationService } from './ProgressInitializationService';

export class AchievementProgressService extends ProgressBaseService {
  /**
   * Facade for all progress update operations with proper type handling
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
  
  static async updateWorkoutCountProgress(
    userId: string,
    count: number,
    target: number,
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    return this.updateProgress(userId, 'workout-count-achievement', count, target, isComplete);
  }
  
  static async updateStreakProgress(
    userId: string,
    currentStreak: number,
    targetStreak: number,
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    return this.updateProgress(userId, 'streak-achievement', currentStreak, targetStreak, isComplete);
  }
  
  static async updatePersonalRecordProgress(
    userId: string,
    currentRecords: number,
    targetRecords: number,
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    return this.updateProgress(userId, 'personal-record-achievement', currentRecords, targetRecords, isComplete);
  }
  
  static async initializeMultipleProgress(
    userId: string,
    achievements: Array<{
      achievementId: string;
      targetValue: number;
    }>
  ): Promise<ServiceResponse<boolean>> {
    return ProgressInitializationService.initializeMultipleProgress(
      userId,
      achievements.map(a => ({
        id: a.achievementId,
        requirements: { value: a.targetValue }
      }))
    );
  }
}
