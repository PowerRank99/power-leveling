
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { AchievementAwardService } from './services/AchievementAwardService';
import { AchievementCheckerService } from './AchievementCheckerService';

/**
 * Standardized achievement service that acts as a facade for all achievement-related operations
 */
export class StandardizedAchievementService {
  /**
   * Check and award a specific achievement to a user
   */
  static async checkAndAwardAchievement(
    userId: string, 
    achievementId: string
  ): Promise<ServiceResponse<boolean>> {
    return AchievementAwardService.awardAchievement(userId, achievementId);
  }
  
  /**
   * Check and award multiple achievements at once
   */
  static async checkAndAwardMultipleAchievements(
    userId: string,
    achievementIds: string[]
  ): Promise<ServiceResponse<string[]>> {
    try {
      if (!userId || !achievementIds.length) {
        return createSuccessResponse([]);
      }

      const awardedAchievements: string[] = [];
      
      // Process each achievement
      for (const achievementId of achievementIds) {
        const result = await AchievementAwardService.awardAchievement(userId, achievementId);
        if (result.success) {
          awardedAchievements.push(achievementId);
        }
      }
      
      return createSuccessResponse(awardedAchievements);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkAndAwardMultipleAchievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Check workout-related achievements
   */
  static async checkWorkoutAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return AchievementCheckerService.checkWorkoutRelatedAchievements(userId);
  }
  
  /**
   * Check streak-related achievements
   */
  static async checkStreakAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return AchievementCheckerService.checkStreakAchievements(userId);
  }
}
