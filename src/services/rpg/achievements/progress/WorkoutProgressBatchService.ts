
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { TransactionService } from '@/services/common/TransactionService';

/**
 * Service for batch workout achievement progress updates
 */
export class WorkoutProgressBatchService {
  /**
   * Update workout count achievement progress
   * Uses optimized batch update function to minimize database calls
   */
  static async updateWorkoutCountProgress(
    userId: string, 
    totalCount: number
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get workout count achievements from centralized definitions
        const workoutCountAchievements = AchievementUtils.getAllAchievements()
          .filter(a => a.category === 'workout' && a.requirementType === 'workouts_count')
          .sort((a, b) => b.requirementValue - a.requirementValue);
        
        // Skip process if no relevant achievements found
        if (workoutCountAchievements.length === 0) {
          console.log('No workout count achievements found to update');
          return;
        }
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = workoutCountAchievements.map(achievement => ({
          achievement_id: achievement.id,
          current_value: totalCount,
          target_value: achievement.requirementValue,
          is_complete: totalCount >= achievement.requirementValue
        }));
        
        // Use the batch update function with retry logic for resilience
        const result = await TransactionService.executeWithRetry(
          async () => {
            const { data, error } = await supabase.rpc('batch_update_achievement_progress', {
              p_user_id: userId,
              p_achievements: JSON.stringify(progressUpdates)
            });
            
            if (error) throw error;
            return data;
          },
          'BATCH_UPDATE_WORKOUT_ACHIEVEMENTS',
          3, // max retries
          'Failed to update workout count achievements'
        );
        
        if (!result.success) {
          console.error('Failed to update workout count achievements:', result.error);
          return;
        }
        
        // Check which achievements are now complete
        const completedAchievements = workoutCountAchievements
          .filter(achievement => totalCount >= achievement.requirementValue)
          .map(achievement => achievement.id);
          
        if (completedAchievements.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, completedAchievements);
        }
      },
      'UPDATE_WORKOUT_COUNT_PROGRESS',
      { showToast: false }
    );
  }
}
