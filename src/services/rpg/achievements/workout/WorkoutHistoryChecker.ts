
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { TransactionService } from '@/services/common/TransactionService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { AchievementCategory } from '@/types/achievementTypes';

export class WorkoutHistoryChecker extends BaseAchievementChecker {
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        // Get achievements with workout history requirements
        const { data: achievements } = await this.fetchAchievementsByCategory(
          'workout_history', // Using string directly since the enum doesn't have this value
          'requirements->count'
        );
        
        // Use transaction service for consistency
        const achievementsToCheck: string[] = [];
        
        await TransactionService.executeWithRetry(
          async () => {
            // Get total workout count
            const { count: workoutCount, error: workoutError } = await supabase
              .from('workouts')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', userId)
              .not('completed_at', 'is', null);
              
            if (workoutError) throw workoutError;
            
            // Get total manual workout count
            const { count: manualCount, error: manualError } = await supabase
              .from('manual_workouts')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', userId);
              
            if (manualError) throw manualError;
            
            const totalWorkouts = (workoutCount || 0) + (manualCount || 0);
            
            // Check each achievement's requirements
            achievements?.forEach(achievement => {
              const requiredCount = achievement.requirements?.count || 0;
              const frequency = achievement.requirements?.frequency || 'daily';
              
              if (totalWorkouts >= requiredCount) {
                achievementsToCheck.push(achievement.id);
              }
            });
          },
          'workout_history_achievements',
          3
        );
        
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'WORKOUT_HISTORY_ACHIEVEMENTS'
    );
  }
}
