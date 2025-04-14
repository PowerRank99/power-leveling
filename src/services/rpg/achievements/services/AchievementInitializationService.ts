
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementUtils } from '@/constants/AchievementDefinitions';
import { Achievement } from '@/types/achievementTypes';
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
        const progressAchievements = allAchievements.filter(
          a => ['workout', 'streak', 'record', 'xp', 'level', 'manual', 'variety'].includes(a.category)
        );
        
        // Convert AchievementDefinition to Achievement to match the expected types
        const achievementsForProgress = progressAchievements.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
          category: a.category,
          rank: a.rank,
          points: a.points,
          xpReward: a.xpReward,
          iconName: a.iconName,
          requirements: {
            type: a.requirementType,
            value: a.requirementValue
          }
        } as Achievement));
        
        await AchievementProgressService.initializeMultipleProgress(userId, achievementsForProgress);
      },
      'INITIALIZE_USER_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
