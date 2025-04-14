
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service specifically for checking activity variety achievements
 */
export class ActivityCheckerService extends BaseAchievementChecker {
  /**
   * Implementation of abstract method from BaseAchievementChecker
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ActivityCheckerService.checkActivityVarietyAchievements(userId);
  }
  
  /**
   * Check activity variety achievements
   */
  static async checkActivityVarietyAchievements(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Get user's activity diversity
      const { data: exercises, error: exercisesError } = await supabase
        .from('workout_sets')
        .select(`
          exercise_id,
          exercises:exercise_id (
            id, type, category, muscle_group
          )
        `)
        .eq('workout_sets.user_id', userId)
        .is('completed', true);
        
      if (exercisesError) {
        return createErrorResponse(
          exercisesError.message,
          'Failed to get user exercise variety',
          ErrorCategory.DATABASE
        );
      }
      
      // Count unique exercise types
      const uniqueTypes = new Set<string>();
      const uniqueCategories = new Set<string>();
      
      exercises?.forEach(item => {
        if (item.exercises?.type) uniqueTypes.add(item.exercises.type);
        if (item.exercises?.category) uniqueCategories.add(item.exercises.category);
      });
      
      // Define achievements to check based on variety
      const achievementsToCheck = [];
      
      if (uniqueTypes.size >= 3) achievementsToCheck.push('variety-3');
      if (uniqueTypes.size >= 5) achievementsToCheck.push('variety-5');
      if (uniqueTypes.size >= 10) achievementsToCheck.push('variety-10');
      
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
   * Check manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Get user's manual workout count
      const { count: manualCount, error: countError } = await supabase
        .from('manual_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (countError) {
        return createErrorResponse(
          countError.message,
          'Failed to count manual workouts',
          ErrorCategory.DATABASE
        );
      }
      
      // Define achievements to check based on manual workout count
      const achievementsToCheck = [];
      
      if (manualCount && manualCount >= 1) achievementsToCheck.push('manual-first');
      if (manualCount && manualCount >= 5) achievementsToCheck.push('manual-5');
      if (manualCount && manualCount >= 10) achievementsToCheck.push('manual-10');
      if (manualCount && manualCount >= 25) achievementsToCheck.push('manual-25');
      
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
