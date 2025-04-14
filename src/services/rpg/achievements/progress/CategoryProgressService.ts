
import { AchievementCategory } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { ProgressUpdateService } from './ProgressUpdateService';
import { ProgressBaseService } from './ProgressBaseService';

/**
 * Service for category-based achievement progress updates
 */
export class CategoryProgressService extends ProgressBaseService {
  /**
   * Batch update progress for achievements by category
   * Use for category-specific updates
   */
  static async batchUpdateByCategory(
    userId: string,
    category: AchievementCategory,
    requirementType: string,
    currentValue: number
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get matching achievements from centralized definitions
        const relevantAchievements = AchievementUtils
          .getAchievementsByCategory(category)
          .filter(a => a.requirementType === requirementType);
          
        // Skip if no relevant achievements found
        if (relevantAchievements.length === 0) {
          console.log(`No ${category} achievements with requirement type ${requirementType} found`);
          return true;
        }
          
        const progressUpdates = relevantAchievements.map(achievement => ({
          achievementId: achievement.id,
          currentValue: currentValue,
          targetValue: achievement.requirementValue,
          isComplete: currentValue >= achievement.requirementValue
        }));
        
        return ProgressUpdateService.updateMultipleProgressValues(userId, progressUpdates).then(result => result.success);
      },
      `UPDATE_${category.toUpperCase()}_${requirementType.toUpperCase()}_PROGRESS`,
      { showToast: false }
    );
  }
}
