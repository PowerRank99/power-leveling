
import { AchievementCategory } from '@/types/achievementTypes';
import { ErrorHandlingService, createErrorResponse } from '@/services/common/ErrorHandlingService';
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
    try {
      const streakAchievements = await AsyncAchievementAdapter.filterAchievements(
        a => a.category === AchievementCategory.STREAK
      );
      
      for (const achievement of streakAchievements) {
        try {
          // Get current streak from user profile (example)
          // This is a placeholder since we don't have a real implementation
          const currentStreak = { data: { current: 0 } };
          
          if (!currentStreak) {
            continue;
          }
          
          // Update progress based on current streak
          await AchievementProgressService.updateProgress(
            userId,
            achievement.id,
            currentStreak.data?.current || 0,
            achievement.requirements?.value || 0,
            currentStreak.data?.current >= (achievement.requirements?.value || 0)
          );
        } catch (error) {
          console.error(
            'UPDATE_STREAK_PROGRESS error:',
            { achievementId: achievement.id, userId, error }
          );
        }
      }
    } catch (error) {
      console.error('Error updating streak achievements:', error);
    }
  }
}
