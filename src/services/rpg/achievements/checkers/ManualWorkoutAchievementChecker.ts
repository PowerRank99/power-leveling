
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { supabase } from '@/integrations/supabase/client';
import { AchievementCategory } from '@/types/achievementTypes';

export class ManualWorkoutAchievementChecker extends BaseAchievementChecker {
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        const { data: achievements } = await this.fetchAchievementsByCategory(
          AchievementCategory.MANUAL, 
          'requirements->count'
        );
        
        const { count, error } = await supabase
          .from('manual_workouts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (error) throw error;
        
        const achievementsToCheck: string[] = [];
        
        achievements?.forEach(achievement => {
          const requiredCount = achievement.requirements?.count || 0;
          if (count && count >= requiredCount) {
            achievementsToCheck.push(achievement.id);
          }
        });
        
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'MANUAL_WORKOUT_ACHIEVEMENTS'
    );
  }
}
