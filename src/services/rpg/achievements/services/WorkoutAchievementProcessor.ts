
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementProgressService } from '../AchievementProgressService';

/**
 * Service for processing workout-related achievements
 */
export class WorkoutAchievementProcessor {
  /**
   * Process workout completion for achievements
   */
  static async processWorkoutCompletion(userId: string, workoutId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get workout count for the user
        const result = await AchievementService.checkWorkoutAchievements(userId, workoutId);
        
        if (result.success && result.data) {
          // Check if result.data has a count property, otherwise use length for arrays
          const workoutCount = typeof result.data === 'object' && 'count' in result.data 
            ? result.data.count 
            : Array.isArray(result.data) ? result.data.length : 0;
            
          // Update progress for workout count achievements
          await AchievementProgressService.updateWorkoutCountProgress(userId, workoutCount);
        }
        
        return result.success && Array.isArray(result.data) ? result.data : [];
      },
      'PROCESS_WORKOUT_COMPLETION',
      { showToast: false }
    );
  }
}
