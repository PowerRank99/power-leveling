
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementProgressService } from '../AchievementProgressService';
import { AchievementUtils } from '@/constants/achievements';

/**
 * Service for initializing achievements for new users
 */
export class AchievementInitializationService {
  /**
   * Initialize user achievements
   * This sets up achievement progress tracking for a new user
   */
  static async initializeUserAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get all achievements from centralized definitions
        const achievements = AchievementUtils.getAllAchievements().map(def => 
          AchievementUtils.convertToAchievement(def)
        );
        
        // Initialize progress tracking for all achievements
        await AchievementProgressService.initializeMultipleProgress(userId, achievements);
      },
      'INITIALIZE_USER_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
