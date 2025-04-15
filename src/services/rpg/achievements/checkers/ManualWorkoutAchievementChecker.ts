
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { supabase } from '@/integrations/supabase/client';

export class ManualWorkoutAchievementChecker extends BaseAchievementChecker {
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        const { data: achievements } = await super.fetchAchievementsByCategory('manual', 'requirements->count');
        
        const { data, error } = await supabase
          .from('manual_workouts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (error) throw error;
        
        const achievementsToCheck: string[] = [];
        
        achievements?.forEach(achievement => {
          const requiredCount = achievement.requirements?.count || 0;
          if (data.count && data.count >= requiredCount) {
            achievementsToCheck.push(achievement.id);
          }
        });
        
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'MANUAL_WORKOUT_ACHIEVEMENTS'
    );
  }
}
