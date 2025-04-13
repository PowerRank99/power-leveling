
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';
import { BaseProgressService } from './BaseProgressService';

/**
 * Service for batch achievement progress updates
 */
export class ProgressBatchService extends BaseProgressService {
  /**
   * Update workout count achievement progress
   * Uses the optimized batch update function
   */
  static async updateWorkoutCountProgress(
    userId: string, 
    totalCount: number
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Workout count achievements with their targets
        const workoutAchievements = [
          { id: 'first-workout', target: 1 },
          { id: 'total-7', target: 7 },
          { id: 'total-10', target: 10 },
          { id: 'total-25', target: 25 },
          { id: 'total-50', target: 50 },
          { id: 'total-100', target: 100 },
          { id: 'total-200', target: 200 }
        ];
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = JSON.stringify(workoutAchievements.map(achievement => ({
          achievement_id: achievement.id,
          current_value: totalCount,
          target_value: achievement.target,
          is_complete: totalCount >= achievement.target
        })));
        
        // Use the batch update function
        const { error } = await supabase.rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: progressUpdates
        });
        
        if (error) {
          throw error;
        }
        
        // Check which achievements are now complete
        const completedAchievements = workoutAchievements
          .filter(achievement => totalCount >= achievement.target)
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
   * Uses the batch update function
   */
  static async updatePersonalRecordProgress(
    userId: string, 
    totalCount: number
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // PR count achievements with their targets
        const prAchievements = [
          { id: 'pr-first', target: 1 },
          { id: 'pr-5', target: 5 },
          { id: 'pr-10', target: 10 },
          { id: 'pr-25', target: 25 },
          { id: 'pr-50', target: 50 }
        ];
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = JSON.stringify(prAchievements.map(achievement => ({
          achievement_id: achievement.id,
          current_value: totalCount,
          target_value: achievement.target,
          is_complete: totalCount >= achievement.target
        })));
        
        // Use the batch update function
        const { error } = await supabase.rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: progressUpdates
        });
        
        if (error) {
          throw error;
        }
        
        // Check which achievements are now complete
        const completedAchievements = prAchievements
          .filter(achievement => totalCount >= achievement.target)
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
   * Uses the batch update function
   */
  static async updateStreakProgress(
    userId: string, 
    currentStreak: number
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Streak achievements with their targets
        const streakAchievements = [
          { id: 'streak-3', target: 3 },
          { id: 'streak-7', target: 7 },
          { id: 'streak-14', target: 14 },
          { id: 'streak-30', target: 30 },
          { id: 'streak-60', target: 60 },
          { id: 'streak-100', target: 100 },
          { id: 'streak-365', target: 365 }
        ];
        
        // Prepare batch update data as expected by the stored procedure
        const progressUpdates = JSON.stringify(streakAchievements.map(achievement => ({
          achievement_id: achievement.id,
          current_value: currentStreak,
          target_value: achievement.target,
          is_complete: currentStreak >= achievement.target
        })));
        
        // Use the batch update function
        const { error } = await supabase.rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: progressUpdates
        });
        
        if (error) {
          throw error;
        }
        
        // Check which achievements are now complete
        const completedAchievements = streakAchievements
          .filter(achievement => currentStreak >= achievement.target)
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
