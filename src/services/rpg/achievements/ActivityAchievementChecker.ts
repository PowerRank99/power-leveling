
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementChecker } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '../AchievementService';
import { TransactionService } from '../../common/TransactionService';

/**
 * Checker for activity-related achievements (variety of exercises, etc.)
 */
export class ActivityAchievementChecker extends BaseAchievementChecker implements AchievementChecker {
  /**
   * Check all achievements related to activity variety
   * Implementation of abstract method from BaseAchievementChecker
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return ActivityAchievementChecker.checkAchievements(userId);
  }
  
  /**
   * Static implementation of checkAchievements
   * Checks for achievements related to activity variety
   */
  static async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');
        
        const awardedAchievements: string[] = [];
        
        await TransactionService.executeWithRetry(
          async () => {
            // Check different types of activity variety achievements
            const varietyResults = await Promise.all([
              this.checkActivityVarietyAchievements(userId),
              this.checkExerciseTypeVarietyAchievements(userId)
            ]);
            
            // Collect awarded achievements
            varietyResults.forEach(result => {
              if (Array.isArray(result)) {
                awardedAchievements.push(...result);
              }
            });
          }, 
          'activity_variety_achievements', 
          3,
          'Failed to check activity variety achievements'
        );
        
        return awardedAchievements;
      },
      'CHECK_ACTIVITY_VARIETY_ACHIEVEMENTS',
      { showToast: false }
    );
  }
  
  /**
   * Check for manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get count of manual workouts
        const { count, error } = await supabase
          .from('manual_workouts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (error) throw error;
        
        const achievementChecks: string[] = [];
        
        // Check achievement criteria
        if (count && count >= 3) achievementChecks.push('manual-3');
        if (count && count >= 10) achievementChecks.push('manual-10');
        
        // Award achievements
        if (achievementChecks.length > 0) {
          const result = await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
          return result.success ? achievementChecks : [];
        }
        
        return [];
      },
      'CHECK_MANUAL_WORKOUT_ACHIEVEMENTS',
      { showToast: false }
    );
  }
  
  /**
   * Check for activity variety achievements (different types of workouts)
   */
  private static async checkActivityVarietyAchievements(userId: string): Promise<string[]> {
    try {
      // Use a custom query to get distinct activity types
      const { data, error } = await supabase
        .from('manual_workouts')
        .select('activity_type')
        .eq('user_id', userId)
        .not('activity_type', 'is', null);
        
      if (error) throw error;
      
      // Count unique activity types
      const distinctTypes = new Set();
      if (data) {
        data.forEach(item => {
          if (item.activity_type) distinctTypes.add(item.activity_type);
        });
      }
      
      const distinctCount = distinctTypes.size;
      
      const achievementChecks: string[] = [];
      
      // Check for achievements based on variety
      if (distinctCount >= 3) achievementChecks.push('activity-variety-3');
      if (distinctCount >= 5) achievementChecks.push('activity-variety-5');
      
      // Award achievements
      if (achievementChecks.length > 0) {
        const result = await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
        return result.success ? achievementChecks : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error checking activity variety achievements:', error);
      return [];
    }
  }
  
  /**
   * Check for exercise type variety achievements (different types of exercises)
   */
  private static async checkExerciseTypeVarietyAchievements(userId: string): Promise<string[]> {
    try {
      // Query to get distinct exercise types from completed workouts
      const { data, error } = await supabase
        .from('workout_sets')
        .select('exercise_id, workouts!inner(user_id)')
        .eq('workouts.user_id', userId)
        .eq('completed', true);
        
      if (error) throw error;
      
      // Get unique exercise IDs
      const uniqueExerciseIds = new Set();
      data.forEach(item => {
        if (item.exercise_id) uniqueExerciseIds.add(item.exercise_id);
      });
      
      const distinctCount = uniqueExerciseIds.size;
      
      const achievementChecks: string[] = [];
      
      // Check for achievements based on variety
      if (distinctCount >= 3) achievementChecks.push('exercise-variety-3');
      if (distinctCount >= 5) achievementChecks.push('exercise-variety-5');
      if (distinctCount >= 10) achievementChecks.push('exercise-variety-10');
      
      // Award achievements
      if (achievementChecks.length > 0) {
        const result = await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
        return result.success ? achievementChecks : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error checking exercise type variety achievements:', error);
      return [];
    }
  }
}
