
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { supabase } from '@/integrations/supabase/client';

export class ActivityVarietyChecker extends BaseAchievementChecker {
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        const { data: achievements } = await super.fetchAchievementsByCategory('variety', 'requirements->count');
        
        const { data, error } = await supabase
          .from('manual_workouts')
          .select('activity_type')
          .eq('user_id', userId)
          .not('activity_type', 'is', null);
          
        if (error) throw error;
        
        const distinctTypes = new Set(data?.map(item => item.activity_type));
        const distinctCount = distinctTypes.size;
        
        const achievementsToCheck: string[] = [];
        
        achievements?.forEach(achievement => {
          const requiredCount = achievement.requirements?.count || 0;
          if (distinctCount >= requiredCount) {
            achievementsToCheck.push(achievement.id);
          }
        });
        
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'ACTIVITY_VARIETY_ACHIEVEMENTS'
    );
  }
}
