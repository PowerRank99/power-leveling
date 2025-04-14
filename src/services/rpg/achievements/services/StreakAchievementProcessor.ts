
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementProgressService } from '../AchievementProgressService';
import { UnifiedAchievementChecker } from '../UnifiedAchievementChecker';

/**
 * Service for processing streak-related achievements
 */
export class StreakAchievementProcessor {
  /**
   * Process streak update for achievements
   */
  static async processStreakUpdate(userId: string, currentStreak: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Update progress for streak achievements
        await AchievementProgressService.updateStreakProgress(userId, currentStreak);
        
        // Check for streak achievements
        const result = await UnifiedAchievementChecker.checkStreakAchievements(userId);
        return result.success ? result.data || [] : [];
      },
      'PROCESS_STREAK_UPDATE',
      { showToast: false }
    );
  }
}
