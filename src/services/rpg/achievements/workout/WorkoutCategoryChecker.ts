import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { AchievementCategory } from '@/types/achievementTypes';

export class WorkoutCategoryChecker extends BaseAchievementChecker {
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        // Get all workout category achievements
        const { data: achievements } = await this.fetchAchievementsByCategory(
          AchievementCategory.WORKOUT_CATEGORY,
          'requirements->count'
        );
        
        if (!achievements?.length) return [];
        
        const { categoryStats } = await this.getWorkoutStats(userId);
        
        // Check achievements
        const achievementsToCheck: string[] = [];
        
        achievements.forEach(achievement => {
          const requiredCategory = achievement.requirements?.category;
          const requiredType = achievement.requirements?.type;
          const requiredCategoryType = achievement.requirements?.category_type;
          const requiredCount = achievement.requirements?.count || 0;
          
          // Check based on category type first
          if (requiredCategoryType && categoryStats.get(requiredCategoryType) >= requiredCount) {
            achievementsToCheck.push(achievement.id);
          }
          // Then check traditional category
          else if (requiredCategory && categoryStats.get(requiredCategory) >= requiredCount) {
            achievementsToCheck.push(achievement.id);
          }
          // Finally check type
          else if (requiredType && categoryStats.get(requiredType) >= requiredCount) {
            achievementsToCheck.push(achievement.id);
          }
        });
        
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'WORKOUT_CATEGORY_ACHIEVEMENTS'
    );
  }
  
  static async checkWorkoutCategoryAchievements(userId: string, achievementsToCheck: string[]): Promise<void> {
    const checker = new WorkoutCategoryChecker();
    const result = await checker.checkAchievements(userId);
    
    if (result.success && result.data) {
      achievementsToCheck.push(...result.data);
    }
  }
}
