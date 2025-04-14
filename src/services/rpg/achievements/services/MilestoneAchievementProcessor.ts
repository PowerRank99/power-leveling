
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementUtils } from '@/constants/achievements';
import { AchievementCategory } from '@/types/achievementTypes';

/**
 * Service for processing milestone achievements (level, XP, etc.)
 */
export class MilestoneAchievementProcessor {
  /**
   * Process level up achievements
   */
  static async processLevelUp(userId: string, currentLevel: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get level achievements from centralized definitions
        const levelAchievements = AchievementUtils
          .getAchievementsByCategory(AchievementCategory.LEVEL)
          .filter(a => a.requirementType === 'level')
          .sort((a, b) => b.requirementValue - a.requirementValue);
        
        // Find achievements to award
        const achievementsToCheck: string[] = [];
        
        for (const achievement of levelAchievements) {
          if (currentLevel >= achievement.requirementValue) {
            achievementsToCheck.push(achievement.id);
          }
        }
        
        // Award achievements
        if (achievementsToCheck.length > 0) {
          const result = await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
          if (result.success && result.data) {
            return Array.isArray(result.data) ? result.data : [];
          }
        }
        
        return [];
      },
      'PROCESS_LEVEL_UP',
      { showToast: false }
    );
  }
  
  /**
   * Process XP milestone achievements
   */
  static async processXPMilestone(userId: string, totalXP: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get XP achievements from centralized definitions
        const xpAchievements = AchievementUtils
          .getAchievementsByCategory(AchievementCategory.XP)
          .filter(a => a.requirementType === 'total_xp')
          .sort((a, b) => b.requirementValue - a.requirementValue);
        
        // Find achievements to award
        const achievementsToCheck: string[] = [];
        
        for (const achievement of xpAchievements) {
          if (totalXP >= achievement.requirementValue) {
            achievementsToCheck.push(achievement.id);
          }
        }
        
        // Award achievements
        if (achievementsToCheck.length > 0) {
          const result = await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
          if (result.success && result.data) {
            return Array.isArray(result.data) ? result.data : [];
          }
        }
        
        return [];
      },
      'PROCESS_XP_MILESTONE',
      { showToast: false }
    );
  }
}
