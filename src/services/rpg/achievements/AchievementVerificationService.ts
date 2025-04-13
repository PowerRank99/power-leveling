
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { TransactionService } from '../../common/TransactionService';
import { AchievementCheckerService } from './AchievementCheckerService';

/**
 * Service for checking achievements based on different triggers
 */
export class AchievementVerificationService {
  /**
   * Check workout achievements
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Use the unified achievement checker service with retry support
        await TransactionService.executeWithRetry(
          async () => await AchievementCheckerService.checkWorkoutRelatedAchievements(userId),
          'check_workout_achievements',
          3,
          'Failed to check workout achievements'
        );
      },
      'CHECK_WORKOUT_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
