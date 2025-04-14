
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { StandardizedAchievementService } from '../StandardizedAchievementService';
import { toast } from 'sonner';
import { AchievementUtils } from '@/constants/AchievementDefinitions';

/**
 * Service for handling achievement awarding operations
 */
export class AchievementAwardService {
  /**
   * Award a single achievement
   */
  static async awardAchievement(userId: string, achievementId: string): Promise<ServiceResponse<boolean>> {
    return StandardizedAchievementService.checkAndAwardAchievement(userId, achievementId);
  }
  
  /**
   * Check and award multiple achievements at once
   */
  static async checkAndAwardAchievements(
    userId: string,
    achievementIds: string[]
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId || !achievementIds.length) return false;

        // Validate achievement IDs against standardized definitions
        const validAchievementIds = achievementIds.filter(id => 
          AchievementUtils.getAchievementById(id) !== undefined
        );
        
        if (validAchievementIds.length === 0) {
          console.warn('No valid achievements found to award');
          return false;
        }

        // Check and award achievements
        const result = await StandardizedAchievementService.checkAndAwardMultipleAchievements(userId, validAchievementIds);
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to check achievements');
        }
        
        // Show notifications for newly awarded achievements
        const newlyAwarded = result.data;
        if (newlyAwarded?.length) {
          newlyAwarded.forEach(achievementId => {
            const achievement = AchievementUtils.getAchievementById(achievementId);
            if (achievement) {
              toast.success('Conquista Desbloqueada! 🏆', {
                description: achievement.name
              });
            }
          });
        }
        
        return newlyAwarded?.length > 0;
      },
      'CHECK_AND_AWARD_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
