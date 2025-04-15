
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementCategory } from '@/types/achievementTypes';
import { AchievementProgressService } from '../AchievementProgressService';
import { AsyncAchievementAdapter } from '../progress/AsyncAchievementAdapter';

/**
 * Service for processing milestone achievements
 */
export class MilestoneAchievementProcessor {
  /**
   * Process level up for achievements
   */
  static async processLevelUp(userId: string, currentLevel: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const unlockedAchievementIds: string[] = [];
        
        // Get level milestone achievements
        const levelAchievements = await AsyncAchievementAdapter.filterAchievements(
          a => a.category === AchievementCategory.LEVEL && a.requirements?.type === 'level'
        );
        
        for (const achievement of levelAchievements) {
          if (currentLevel >= (achievement.requirements?.value || 0)) {
            // Update progress and mark as complete
            await AchievementProgressService.updateProgress(
              userId, 
              achievement.id, 
              currentLevel, 
              achievement.requirements?.value || 0, 
              true
            );
            unlockedAchievementIds.push(achievement.id);
          }
        }
        
        return unlockedAchievementIds;
      },
      'PROCESS_LEVEL_UP',
      { showToast: false }
    );
  }
  
  /**
   * Process XP milestone for achievements
   */
  static async processXPMilestone(userId: string, totalXP: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const unlockedAchievementIds: string[] = [];
        
        // Get XP milestone achievements
        const xpAchievements = await AsyncAchievementAdapter.filterAchievements(
          a => a.category === AchievementCategory.XP && a.requirements?.type === 'xp'
        );
        
        for (const achievement of xpAchievements) {
          if (totalXP >= (achievement.requirements?.value || 0)) {
            // Update progress and mark as complete
            await AchievementProgressService.updateProgress(
              userId, 
              achievement.id,
              totalXP,
              achievement.requirements?.value || 0,
              true
            );
            unlockedAchievementIds.push(achievement.id);
          }
        }
        
        return unlockedAchievementIds;
      },
      'PROCESS_XP_MILESTONE',
      { showToast: false }
    );
  }
  
  /**
   * Check for workout milestones (legacy method)
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
            await AchievementProgressService.updateProgress(
              userId,
              achievement.id,
              workoutCount,
              achievement.requirements?.value || 0,
              true
            );
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
   * Check for streak milestones (legacy method)
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
            await AchievementProgressService.updateProgress(
              userId,
              achievement.id,
              streakCount,
              achievement.requirements?.value || 0,
              true
            );
            unlockedAchievementIds.push(achievement.id);
          }
        }
        
        return unlockedAchievementIds;
      },
      'CHECK_STREAK_MILESTONES',
      { showToast: false }
    );
  }
}
