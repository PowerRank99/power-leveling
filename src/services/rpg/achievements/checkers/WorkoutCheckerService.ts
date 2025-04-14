
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { ACHIEVEMENT_IDS, ACHIEVEMENT_REQUIREMENTS } from '../AchievementConstants';
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
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        // Get user's workout stats
        const workoutStats = await WorkoutStatsService.getWorkoutStats(userId);
        const userProfile = await WorkoutStatsService.getUserProfile(userId);
        
        if (!userProfile) {
          throw new Error(`User profile with ID ${userId} not found`);
        }
        
        // Track all awarded achievements
        let awardedAchievements: string[] = [];
        
        // Check achievements by rank (starting with basic ones)
        // Since these methods return void, we'll implement direct tracking here
        await RankEAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
        await RankDAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
        await HigherRankAchievementChecker.checkRankCAchievements(userId, workoutStats, userProfile);
        await HigherRankAchievementChecker.checkHigherRankAchievements(userId, workoutStats, userProfile);
        
        // Define some basic achievements to check directly using constants
        const achievementsToCheck: string[] = [];
        
        if (workoutStats.totalCount >= 1) achievementsToCheck.push(ACHIEVEMENT_IDS.E.workout[0]); // first-workout
        if (workoutStats.totalCount >= 7) achievementsToCheck.push(ACHIEVEMENT_IDS.E.workout[2]); // total-7
        if (workoutStats.weeklyCount >= 3) achievementsToCheck.push(ACHIEVEMENT_IDS.E.workout[1]); // weekly-3
        
        // Award these direct achievements
        const newlyAwarded = await this.awardAchievementsBatch(userId, achievementsToCheck);
        awardedAchievements = [...awardedAchievements, ...newlyAwarded];
        
        return awardedAchievements;
      },
      'WORKOUT_ACHIEVEMENTS'
    );
  }
  
  /**
   * Static method to check workout-related achievements
   */
  static async checkWorkoutAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const checker = new WorkoutCheckerService();
    return checker.checkAchievements(userId);
  }
}
