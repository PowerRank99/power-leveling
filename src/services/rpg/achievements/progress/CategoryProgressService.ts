
import { Achievement, AchievementCategory } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { AsyncAchievementAdapter } from './AsyncAchievementAdapter';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementProgressService } from '../AchievementProgressService';

/**
 * Service for handling achievement progress related to specific categories
 */
export class CategoryProgressService {
  /**
   * Get achievements by category with async support
   */
  static async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    return AsyncAchievementAdapter.filterAchievements(a => a.category === category);
  }
  
  /**
   * Batch update progress for achievements by category
   */
  static async batchUpdateByCategory(
    userId: string,
    category: AchievementCategory,
    requirementType: string,
    currentValue: number
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const achievements = await this.getAchievementsByCategory(category);
        
        const relevantAchievements = achievements.filter(a => 
          a.requirements?.type === requirementType
        );
        
        // Prepare progress updates
        const progressUpdates = relevantAchievements.map(achievement => {
          const requirementValue = achievement.requirements?.value || 0;
          const isComplete = currentValue >= requirementValue;
          
          return {
            achievementId: achievement.id,
            currentValue: Math.min(currentValue, requirementValue),
            targetValue: requirementValue,
            isComplete
          };
        });
        
        // Update progress in a batch
        if (progressUpdates.length > 0) {
          await AchievementProgressService.updateMultipleProgressValues(userId, progressUpdates);
        }
        
        return createSuccessResponse(true);
      },
      'BATCH_UPDATE_BY_CATEGORY',
      { showToast: false }
    );
  }
}
