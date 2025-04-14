
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { TransactionService } from '@/services/common/TransactionService';

/**
 * Service for batch streak achievement progress updates
 */
export class StreakProgressBatchService {
  /**
   * Update streak achievement progress
   * Uses batch update function to minimize database calls
   */
  static async updateStreakProgress(
    userId: string, 
    currentStreak: number
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get streak achievements from centralized definitions
        const streakAchievements = AchievementUtils.getAllAchievements()
          .filter(a => a.category === 'streak' && a.requirementType === 'streak_days')
          .sort((a, b) => b.requirementValue - a.requirementValue);
        
        // Skip process if no relevant achievements found
        if (streakAchievements.length === 0) {
          console.log('No streak achievements found to update');
          return;
        }
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = streakAchievements.map(achievement => ({
          achievement_id: achievement.id,
          current_value: currentStreak,
          target_value: achievement.requirementValue,
          is_complete: currentStreak >= achievement.requirementValue
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
          'BATCH_UPDATE_STREAK_ACHIEVEMENTS',
          3, // max retries
          'Failed to update streak achievements'
        );
        
        if (!result.success) {
          console.error('Failed to update streak achievements:', result.error);
          return;
        }
        
        // Check which achievements are now complete
        const completedAchievements = streakAchievements
          .filter(achievement => currentStreak >= achievement.requirementValue)
          .map(achievement => achievement.id);
          
        if (completedAchievements.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, completedAchievements);
        }
      },
      'UPDATE_STREAK_PROGRESS',
      { showToast: false }
    );
  }
}
