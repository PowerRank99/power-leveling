
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorCategory, createErrorResponse, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '../AchievementService';
import { WorkoutCategoryChecker } from './workout/WorkoutCategoryChecker';
import { WeeklyWorkoutChecker } from './workout/WeeklyWorkoutChecker';

/**
 * Service for checking workout-related achievements
 */
export class WorkoutAchievementChecker {
  /**
   * Check all achievements that might be triggered by a workout completion
   */
  static async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    try {
      // Get workout counts and other achievement-related data
      const { data: stats, error } = await supabase
        .from('profiles')
        .select('workouts_count, streak')
        .eq('id', userId)
        .single();
      
      if (error) {
        return createErrorResponse(
          error.message,
          `Failed to fetch user stats for achievements: ${error.message}`,
          ErrorCategory.DATABASE
        );
      }
      
      // Array to collect achievements that should be checked
      const achievementsToCheck: string[] = [];
      
      // Basic workout achievements
      if (stats.workouts_count === 1) {
        achievementsToCheck.push('primeiro-treino');
      }
      
      if (stats.workouts_count >= 7) {
        achievementsToCheck.push('embalo-fitness');
      }
      
      // Streak achievements
      if (stats.streak >= 3) {
        achievementsToCheck.push('trinca-poderosa');
      }
      
      if (stats.streak >= 7) {
        achievementsToCheck.push('semana-impecavel');
      }
      
      // Check category-specific achievements
      await WorkoutCategoryChecker.checkWorkoutCategoryAchievements(userId, achievementsToCheck);
      
      // Check weekly achievements
      const { data: workouts } = await supabase
        .from('workouts')
        .select('started_at')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });
        
      if (workouts) {
        const weeklyAchievements = await WeeklyWorkoutChecker.checkWeeklyWorkouts(workouts);
        achievementsToCheck.push(...weeklyAchievements);
      }
      
      // Award any earned achievements
      if (achievementsToCheck.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
      }
      
      return createSuccessResponse(achievementsToCheck);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception checking workout achievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
}
