import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementCategory } from '@/types/achievementTypes';
import { AchievementProgressService } from '../AchievementProgressService';
import { AsyncAchievementAdapter } from '../progress/AsyncAchievementAdapter';

/**
 * Service for processing milestone achievements
 */
export class MilestoneAchievementProcessor {
  /**
   * Check for workout milestones
   */
  static async checkForWorkoutMilestones(userId: string, workoutCount: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const unlockedAchievementIds: string[] = [];
        
        // Get workout milestone achievements
        const milestoneAchievements = await AsyncAchievementAdapter.filterAchievements(
          a => a.category === AchievementCategory.MILESTONE && a.requirements?.type === 'workout_count'
        );
        
        for (const achievement of milestoneAchievements) {
          if (workoutCount >= (achievement.requirements?.value || 0)) {
            // Update progress and award achievement
            await AchievementProgressService.completeAchievement(userId, achievement.id);
            unlockedAchievementIds.push(achievement.id);
          }
        }
        
        return unlockedAchievementIds;
      },
      'CHECK_WORKOUT_MILESTONES',
      { showToast: false }
    );
  }
  
  /**
   * Check for streak milestones
   */
  static async checkForStreakMilestones(userId: string, streakCount: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const unlockedAchievementIds: string[] = [];
        
        // Get streak milestone achievements
        const streakAchievements = await AsyncAchievementAdapter.filterAchievements(
          a => a.category === AchievementCategory.MILESTONE && a.requirements?.type === 'streak_count'
        );
        
        for (const achievement of streakAchievements) {
          if (streakCount >= (achievement.requirements?.value || 0)) {
            // Update progress and award achievement
            await AchievementProgressService.completeAchievement(userId, achievement.id);
            unlockedAchievementIds.push(achievement.id);
          }
        }
        
        return unlockedAchievementIds;
      },
      'CHECK_STREAK_MILESTONES',
      { showToast: false }
    );
  }
  
  // Add other milestone checks here (e.g., XP, level, etc.)
}
