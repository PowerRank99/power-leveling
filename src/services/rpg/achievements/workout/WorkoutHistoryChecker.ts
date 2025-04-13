
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { TransactionService } from '@/services/common/TransactionService';
import { AchievementService } from '@/services/rpg/AchievementService';

/**
 * Checker specifically for workout history achievements
 */
export class WorkoutHistoryChecker {
  /**
   * Check workout history achievements
   */
  static async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get total workout count 
        const { count: workoutCount, error: workoutError } = await supabase
          .from('workouts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .not('completed_at', 'is', null);
          
        if (workoutError) throw workoutError;
        
        // Get total manual workout count
        const { count: manualWorkoutCount, error: manualError } = await supabase
          .from('manual_workouts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (manualError) throw manualError;
        
        // Combined count
        const totalWorkouts = (workoutCount || 0) + (manualWorkoutCount || 0);
        
        // Use transaction service for consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Check for workout count achievements
            const achievementChecks = [];
            
            if (totalWorkouts >= 7) achievementChecks.push('embalo_fitness');
            if (totalWorkouts >= 10) achievementChecks.push('dedicacao_semanal');
            
            // Get workouts per week
            const { data: weekData, error: weekError } = await supabase
              .from('workouts')
              .select('started_at')
              .eq('user_id', userId)
              .not('completed_at', 'is', null)
              .gte('started_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
              
            if (weekError) throw weekError;
            
            // Check for weekly workout achievements
            if (weekData && weekData.length >= 3) {
              achievementChecks.push('trio_na_semana');
            }
            
            // Check all achievements in batch
            if (achievementChecks.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
            }
          }, 
          'workout_history_achievements', 
          3, 
          'Failed to check workout history achievements'
        );
      },
      'CHECK_WORKOUT_HISTORY_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
