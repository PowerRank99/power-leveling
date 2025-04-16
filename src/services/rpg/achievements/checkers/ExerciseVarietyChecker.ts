
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { supabase } from '@/integrations/supabase/client';
import { AchievementCategory } from '@/types/achievementTypes';

export class ExerciseVarietyChecker extends BaseAchievementChecker {
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        const { data: achievements } = await this.fetchAchievementsByCategory(
          AchievementCategory.EXERCISE_VARIETY, 
          'requirements->count'
        );
        
        const { data, error } = await supabase
          .from('workout_sets')
          .select('exercise_id, workouts!inner(user_id)')
          .eq('workouts.user_id', userId)
          .eq('completed', true);
          
        if (error) throw error;
        
        const uniqueExerciseIds = new Set(data?.map(item => item.exercise_id));
        const distinctCount = uniqueExerciseIds.size;
        
        const achievementsToCheck: string[] = [];
        
        achievements?.forEach(achievement => {
          const requiredCount = achievement.requirements?.count || 0;
          if (distinctCount >= requiredCount) {
            achievementsToCheck.push(achievement.id);
          }
        });
        
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'EXERCISE_VARIETY_ACHIEVEMENTS'
    );
  }
}
