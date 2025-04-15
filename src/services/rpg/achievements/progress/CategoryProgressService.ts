
import { AchievementCategory } from '@/types/achievementTypes';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AsyncAchievementAdapter } from './AsyncAchievementAdapter';
import { AchievementProgressService } from '../AchievementProgressService';

/**
 * Service for batch processing category-related achievement progress
 */
export class CategoryProgressService {
  /**
   * Update progress for all achievements in a specific category
   */
  static async updateCategoryProgress(
    userId: string, 
    category: AchievementCategory, 
    currentValue: number
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const achievements = await AsyncAchievementAdapter.filterAchievements(
          a => a.category === category
        );
        
        for (const achievement of achievements) {
          const requirementValue = achievement.requirements?.value || 0;
          const isCompleted = currentValue >= requirementValue;
          
          await AchievementProgressService.updateProgress(
            userId,
            achievement.id,
            currentValue,
            requirementValue,
            isCompleted
          );
        }
        
        return true;
      },
      'UPDATE_CATEGORY_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Batch update progress for multiple categories at once
   */
  static async batchUpdateCategoryProgress(
    userId: string,
    categoryValues: Record<AchievementCategory, number>
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const categories = Object.entries(categoryValues) as [AchievementCategory, number][];
        
        for (const [category, value] of categories) {
          await this.updateCategoryProgress(userId, category, value);
        }
        
        return true;
      },
      'BATCH_UPDATE_CATEGORY_PROGRESS',
      { showToast: false }
    );
  }
  
  /**
   * Batch update progress by category and requirement type
   */
  static async batchUpdateByCategory(
    userId: string,
    category: AchievementCategory,
    requirementType: string,
    currentValue: number
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const achievements = await AsyncAchievementAdapter.filterAchievements(
          a => a.category === category && a.requirements?.type === requirementType
        );
        
        for (const achievement of achievements) {
          const requirementValue = achievement.requirements?.value || 0;
          const isCompleted = currentValue >= requirementValue;
          
          await AchievementProgressService.updateProgress(
            userId,
            achievement.id,
            currentValue,
            requirementValue,
            isCompleted
          );
        }
        
        return true;
      },
      'BATCH_UPDATE_BY_CATEGORY',
      { showToast: false }
    );
  }
}
