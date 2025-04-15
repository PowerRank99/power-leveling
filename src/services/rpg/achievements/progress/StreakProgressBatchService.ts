import { AchievementCategory } from '@/types/achievementTypes';
import { ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { AchievementProgressService } from '../AchievementProgressService';
import { AsyncAchievementAdapter } from './AsyncAchievementAdapter';

/**
 * Service for batch processing streak-related achievement progress
 */
export class StreakProgressBatchService {
  /**
   * Update progress for all streak-related achievements
   */
  static async updateAllStreakProgress(userId: string): Promise<void> {
    const streakAchievements = await AsyncAchievementAdapter.filterAchievements(
      a => a.category === AchievementCategory.STREAK
    );
    
    for (const achievement of streakAchievements) {
      try {
        // Get current streak from user profile (example)
        const currentStreak = await AchievementUtils.getAchievementProgress(userId, achievement.id);
        
        if (!currentStreak) {
          continue;
        }
        
        // Update progress based on current streak
        await AchievementProgressService.updateProgress(
          userId,
          achievement.id,
          currentStreak.data?.current || 0,
          achievement.requirements.value,
          currentStreak.data?.current >= achievement.requirements.value
        );
      } catch (error) {
        ErrorHandlingService.logError(
          error,
          'UPDATE_STREAK_PROGRESS',
          { achievementId: achievement.id, userId }
        );
      }
    }
  }
}
