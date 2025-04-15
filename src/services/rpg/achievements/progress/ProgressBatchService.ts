import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { WorkoutProgressBatchService } from './WorkoutProgressBatchService';
import { StreakProgressBatchService } from './StreakProgressBatchService';
import { RecordProgressBatchService } from './RecordProgressBatchService';

/**
 * Batch processing service for achievement progress
 */
export class ProgressBatchService {
  /**
   * Process all achievement types in a single batch operation
   */
  static async processAllAchievementProgress(userId: string): Promise<void> {
    // Fix method reference
    await WorkoutProgressBatchService.updateAllWorkoutProgress(userId);
    await StreakProgressBatchService.updateAllStreakProgress(userId);
    await RecordProgressBatchService.updateAllRecordProgress(userId);
    
    try {
      // Additional processing can be added here
    } catch (error) {
      console.error('Error in processAllAchievementProgress:', error);
    }
  }
  
  /**
   * Update progress for all achievement types
   */
  static async updateAllProgress(userId: string): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        await this.processAllAchievementProgress(userId);
        return true;
      },
      'UPDATE_ALL_ACHIEVEMENT_PROGRESS',
      { showToast: false }
    );
  }
}
