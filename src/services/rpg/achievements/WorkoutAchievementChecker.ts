
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorCategory, createErrorResponse, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '../AchievementService';

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
      
      // First workout achievement
      if (stats.workouts_count === 1) {
        achievementsToCheck.push('primeiro-treino');
      }
      
      // Workout count milestones
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
      
      // Check workout category achievements
      await this.checkWorkoutCategoryAchievements(userId, achievementsToCheck);
      
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
  
  /**
   * Check achievements related to workout categories (strength, cardio, etc)
   */
  private static async checkWorkoutCategoryAchievements(
    userId: string, 
    achievementsToCheck: string[]
  ): Promise<void> {
    try {
      // Get counts of different workout categories
      const { data, error } = await supabase
        .from('workouts')
        .select('category')
        .eq('user_id', userId);
      
      if (error) throw new Error(error.message);
      
      // Count workouts by category
      const categoryCounts: Record<string, number> = {};
      data?.forEach(workout => {
        const category = workout.category || 'unknown';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Check for category-specific achievements
      if (categoryCounts['strength'] >= 10) {
        achievementsToCheck.push('forca-de-guerreiro');
      }
      
      if (categoryCounts['cardio'] >= 10) {
        achievementsToCheck.push('cardio-sem-folego');
      }
      
      if (categoryCounts['mobility'] >= 10) {
        achievementsToCheck.push('guru-do-alongamento');
      }
      
      if (categoryCounts['calisthenics'] >= 10) {
        achievementsToCheck.push('forca-interior');
      }
      
      if (categoryCounts['sport'] >= 10) {
        achievementsToCheck.push('craque-dos-esportes');
      }
      
      // Check for first sport workout
      if (categoryCounts['sport'] >= 1) {
        achievementsToCheck.push('esporte-de-primeira');
      }
      
    } catch (error) {
      console.error('Error checking workout category achievements:', error);
    }
  }
  
  /**
   * Check achievements based on workout history
   */
  static async checkWorkoutHistoryAchievements(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Get workout history data
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('id, started_at')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });
      
      if (error) {
        return createErrorResponse(
          error.message,
          `Failed to fetch workout history: ${error.message}`,
          ErrorCategory.DATABASE
        );
      }
      
      // Weekly workout count achievements
      const achievementsToCheck = await this.checkWeeklyWorkouts(workouts);
      
      // Award any earned achievements
      if (achievementsToCheck.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
      }
      
      return createSuccessResponse(undefined);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception checking workout history achievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Check for achievements related to weekly workout patterns
   */
  private static async checkWeeklyWorkouts(workouts: any[]): Promise<string[]> {
    try {
      const achievementsToCheck: string[] = [];
      
      if (!workouts || workouts.length === 0) return achievementsToCheck;
      
      // Group workouts by week
      const workoutsByWeek: Record<string, number> = {};
      
      workouts.forEach(workout => {
        if (!workout.started_at) return;
        
        const date = new Date(workout.started_at);
        const weekKey = `${date.getFullYear()}-${this.getWeekNumber(date)}`;
        
        workoutsByWeek[weekKey] = (workoutsByWeek[weekKey] || 0) + 1;
      });
      
      // Check for 3+ workouts in a week
      const hasThreeInWeek = Object.values(workoutsByWeek).some(count => count >= 3);
      if (hasThreeInWeek) {
        achievementsToCheck.push('trio-na-semana');
      }
      
      return achievementsToCheck;
    } catch (error) {
      console.error('Error checking weekly workouts:', error);
      return [];
    }
  }
  
  /**
   * Helper to get week number from date
   */
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
