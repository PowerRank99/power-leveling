
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';
import { BaseProgressService } from './BaseProgressService';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { TransactionService } from '@/services/common/TransactionService';
import { toast } from 'sonner';

/**
 * Service for batch achievement progress updates
 * Optimizes database operations by using bulk updates
 */
export class ProgressBatchService extends BaseProgressService {
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
  
  /**
   * Update personal record achievement progress
   * Uses batch update function to minimize database calls
   */
  static async updatePersonalRecordProgress(
    userId: string, 
    totalCount: number
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get PR achievements from centralized definitions
        const prAchievements = AchievementUtils.getAllAchievements()
          .filter(a => a.category === 'record' && a.requirementType === 'pr_count')
          .sort((a, b) => b.requirementValue - a.requirementValue);
        
        // Skip process if no relevant achievements found
        if (prAchievements.length === 0) {
          console.log('No PR achievements found to update');
          return;
        }
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = prAchievements.map(achievement => ({
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
          'BATCH_UPDATE_PR_ACHIEVEMENTS',
          3, // max retries
          'Failed to update personal record achievements'
        );
        
        if (!result.success) {
          console.error('Failed to update PR achievements:', result.error);
          return;
        }
        
        // Check which achievements are now complete
        const completedAchievements = prAchievements
          .filter(achievement => totalCount >= achievement.requirementValue)
          .map(achievement => achievement.id);
          
        if (completedAchievements.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, completedAchievements);
        }
      },
      'UPDATE_PR_PROGRESS',
      { showToast: false }
    );
  }
  
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
  
  /**
   * Generic batch update method for achievements
   * Can be used for any type of achievement progress update
   */
  static async batchUpdateProgress(
    userId: string,
    achievements: Array<{
      achievementId: string,
      currentValue: number,
      targetValue: number,
      isComplete: boolean
    }>
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId || !achievements.length) {
          console.log('No achievements to update');
          return;
        }
        
        // Format the data for the RPC call
        const progressData = achievements.map(achievement => ({
          achievement_id: achievement.achievementId,
          current_value: achievement.currentValue,
          target_value: achievement.targetValue,
          is_complete: achievement.isComplete
        }));
        
        // Use the batch update function
        const { error } = await supabase.rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: JSON.stringify(progressData)
        });
        
        if (error) {
          throw error;
        }
      },
      'BATCH_UPDATE_ACHIEVEMENT_PROGRESS',
      { showToast: false }
    );
  }
}
