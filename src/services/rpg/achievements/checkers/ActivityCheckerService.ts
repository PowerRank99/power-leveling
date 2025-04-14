
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';

/**
 * Service specifically for checking activity-related achievements
 */
export class ActivityCheckerService extends BaseAchievementChecker {
  /**
   * Implementation of abstract method from BaseAchievementChecker
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ActivityCheckerService.checkActivityVarietyAchievements(userId);
  }
  
  /**
   * Check achievements related to activity variety
   */
  static async checkActivityVarietyAchievements(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Get distinct activity types from user's records
      const { data, error } = await supabase.rpc('get_distinct_activity_types', {
        p_user_id: userId
      });
      
      if (error) {
        return createErrorResponse(
          error.message,
          'Failed to get distinct activity types',
          ErrorCategory.DATABASE
        );
      }
      
      // Count distinct types
      const distinctCount = data?.length || 0;
      
      // Check for achievements
      const achievementsToCheck: string[] = [];
      
      if (distinctCount >= 3) achievementsToCheck.push('activity-variety-3');
      if (distinctCount >= 5) achievementsToCheck.push('activity-variety-5');
      
      // Award achievements
      if (achievementsToCheck.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
      }
      
      return createSuccessResponse(undefined);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkActivityVarietyAchievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Check for exercise type variety within workout records
   */
  static async checkExerciseTypeVarietyAchievements(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Query to get distinct exercise types from completed workouts
      const { data, error } = await supabase
        .from('workout_sets')
        .select('exercise_id, workouts!inner(user_id)')
        .eq('workouts.user_id', userId)
        .eq('completed', true);
        
      if (error) {
        return createErrorResponse(
          error.message,
          'Failed to get exercise varieties',
          ErrorCategory.DATABASE
        );
      }
      
      // Get unique exercise IDs
      const uniqueExerciseIds = new Set();
      if (data) {
        data.forEach(item => {
          if (item.exercise_id) uniqueExerciseIds.add(item.exercise_id);
        });
      }
      
      const distinctCount = uniqueExerciseIds.size;
      
      // Check for achievements
      const achievementsToCheck: string[] = [];
      
      if (distinctCount >= 3) achievementsToCheck.push('exercise-variety-3');
      if (distinctCount >= 5) achievementsToCheck.push('exercise-variety-5');
      if (distinctCount >= 10) achievementsToCheck.push('exercise-variety-10');
      
      // Award achievements
      if (achievementsToCheck.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
      }
      
      return createSuccessResponse(undefined);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkExerciseTypeVarietyAchievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Check for manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Get count of manual workouts
      const { count, error } = await supabase
        .from('manual_workouts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
          
      if (error) {
        return createErrorResponse(
          error.message,
          'Failed to count manual workouts',
          ErrorCategory.DATABASE
        );
      }
      
      // Check for achievement criteria
      const achievementsToCheck: string[] = [];
      
      if (count && count >= 3) achievementsToCheck.push('manual-3');
      if (count && count >= 10) achievementsToCheck.push('manual-10');
      
      // Award achievements
      if (achievementsToCheck.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
      }
      
      return createSuccessResponse(undefined);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkManualWorkoutAchievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
}
