
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementCategory } from '@/types/achievementTypes';
import { BaseAchievementChecker } from '../BaseAchievementChecker';

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
        
        // Get user's workout categories count
        const { data: workouts, error } = await supabase
          .from('workouts')
          .select(`
            id,
            workout_sets (
              exercise_id,
              exercises (
                type,
                category
              )
            )
          `)
          .eq('user_id', userId);
          
        if (error) throw error;
        
        // Count unique categories
        const categoryStats = new Map<string, number>();
        workouts?.forEach(workout => {
          workout.workout_sets?.forEach(set => {
            if (set.exercises?.category) {
              const count = categoryStats.get(set.exercises.category) || 0;
              categoryStats.set(set.exercises.category, count + 1);
            }
            if (set.exercises?.type) {
              const count = categoryStats.get(set.exercises.type) || 0;
              categoryStats.set(set.exercises.type, count + 1);
            }
          });
        });
        
        // Check achievements
        const achievementsToCheck: string[] = [];
        
        achievements.forEach(achievement => {
          const requiredCategory = achievement.requirements?.category;
          const requiredCount = achievement.requirements?.count || 0;
          
          if (requiredCategory && categoryStats.get(requiredCategory) >= requiredCount) {
            achievementsToCheck.push(achievement.id);
          }
        });
        
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'WORKOUT_CATEGORY_ACHIEVEMENTS'
    );
  }
}
