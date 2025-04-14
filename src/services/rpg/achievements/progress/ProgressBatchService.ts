
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';
import { BaseProgressService } from './BaseProgressService';
import { AchievementUtils, ACHIEVEMENTS } from '@/constants/AchievementDefinitions';

/**
 * Service for batch achievement progress updates
 */
export class ProgressBatchService extends BaseProgressService {
  /**
   * Update workout count achievement progress
   * Uses the optimized batch update function and the centralized achievement definitions
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
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = workoutCountAchievements.map(achievement => ({
          achievement_id: achievement.id,
          current_value: totalCount,
          target_value: achievement.requirementValue,
          is_complete: totalCount >= achievement.requirementValue
        }));
        
        // Use the batch update function
        const { error } = await supabase.rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: JSON.stringify(progressUpdates)
        });
        
        if (error) {
          throw error;
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
   * Uses the batch update function and the centralized achievement definitions
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
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = prAchievements.map(achievement => ({
          achievement_id: achievement.id,
          current_value: totalCount,
          target_value: achievement.requirementValue,
          is_complete: totalCount >= achievement.requirementValue
        }));
        
        // Use the batch update function
        const { error } = await supabase.rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: JSON.stringify(progressUpdates)
        });
        
        if (error) {
          throw error;
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
   * Uses the batch update function and the centralized achievement definitions
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
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = streakAchievements.map(achievement => ({
          achievement_id: achievement.id,
          current_value: currentStreak,
          target_value: achievement.requirementValue,
          is_complete: currentStreak >= achievement.requirementValue
        }));
        
        // Use the batch update function
        const { error } = await supabase.rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: JSON.stringify(progressUpdates)
        });
        
        if (error) {
          throw error;
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
