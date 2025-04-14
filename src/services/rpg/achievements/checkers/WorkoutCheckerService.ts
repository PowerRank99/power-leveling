
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { WorkoutStatsService } from '../workout/WorkoutStatsService';
import { RankEAchievementChecker } from '../workout/RankEAchievementChecker';
import { RankDAchievementChecker } from '../workout/RankDAchievementChecker';
import { HigherRankAchievementChecker } from '../workout/HigherRankAchievementChecker';

/**
 * Service specifically for checking workout-related achievements
 */
export class WorkoutCheckerService extends BaseAchievementChecker {
  /**
   * Implementation of abstract method from BaseAchievementChecker
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return WorkoutCheckerService.checkWorkoutAchievements(userId);
  }
  
  /**
   * Check workout-related achievements
   */
  static async checkWorkoutAchievements(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Get user's workout stats
      const workoutStats = await WorkoutStatsService.getWorkoutStats(userId);
      const userProfile = await WorkoutStatsService.getUserProfile(userId);
      
      if (!userProfile) {
        return createErrorResponse(
          'User profile not found',
          `User profile with ID ${userId} not found`,
          ErrorCategory.VALIDATION
        );
      }
      
      // Check achievements by rank (starting with basic ones)
      await RankEAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
      await RankDAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
      await HigherRankAchievementChecker.checkRankCAchievements(userId, workoutStats, userProfile);
      await HigherRankAchievementChecker.checkHigherRankAchievements(userId, workoutStats, userProfile);
      
      return createSuccessResponse(undefined);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkWorkoutAchievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Check workout history for achievements
   */
  static async checkWorkoutHistoryAchievements(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Get user's workout history stats
      const { count: workoutCount, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (countError) {
        return createErrorResponse(
          countError.message,
          'Failed to count workouts',
          ErrorCategory.DATABASE
        );
      }
      
      // Get user's profile
      const userProfile = await WorkoutStatsService.getUserProfile(userId);
      
      if (!userProfile) {
        return createErrorResponse(
          'User profile not found',
          `User profile with ID ${userId} not found`,
          ErrorCategory.VALIDATION
        );
      }
      
      // Create simplified workout stats
      const workoutStats = {
        totalCount: workoutCount || 0,
        weeklyCount: 0, // Not needed for history check
        monthlyCount: 0  // Not needed for history check
      };
      
      // Check achievements by rank (focusing on count-based ones)
      await RankEAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
      await RankDAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
      await HigherRankAchievementChecker.checkRankCAchievements(userId, workoutStats, userProfile);
      await HigherRankAchievementChecker.checkHigherRankAchievements(userId, workoutStats, userProfile);
      
      return createSuccessResponse(undefined);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkWorkoutHistoryAchievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
}
