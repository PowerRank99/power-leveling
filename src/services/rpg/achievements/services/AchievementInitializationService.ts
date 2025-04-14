
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementUtils } from '@/constants/AchievementDefinitions';
import { Achievement, AchievementCategory } from '@/types/achievementTypes';
import { AchievementProgressService } from '../AchievementProgressService';

/**
 * Service specialized in initializing achievement-related data
 */
export class AchievementInitializationService {
  /**
   * Initialize achievements for a new user
   */
  static async initializeUserAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get all achievements from centralized definitions
        const allAchievements = AchievementUtils.getAllAchievements();
        
        // Initialize progress tracking for achievements that need it
        const progressCategories: string[] = [
          AchievementCategory.WORKOUT,
          AchievementCategory.STREAK,
          AchievementCategory.RECORD,
          AchievementCategory.XP,
          AchievementCategory.LEVEL,
          AchievementCategory.MANUAL,
          AchievementCategory.VARIETY
        ];
        
        const progressAchievements = allAchievements.filter(
          a => progressCategories.includes(a.category)
        );
        
        // Convert AchievementDefinition to Achievement to match the expected types
        const achievementsForProgress = progressAchievements.map(a => 
          AchievementUtils.convertToAchievement(a)
        );
        
        await AchievementProgressService.initializeMultipleProgress(userId, achievementsForProgress);
      },
      'INITIALIZE_USER_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
