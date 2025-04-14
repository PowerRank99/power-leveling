
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { WorkoutCheckerService } from './checkers/WorkoutCheckerService';
import { StreakCheckerService } from './checkers/StreakCheckerService';
import { RecordCheckerService } from './checkers/RecordCheckerService';
import { XPCheckerService } from './checkers/XPCheckerService';
import { ActivityCheckerService } from './checkers/ActivityCheckerService';
import { PersonalRecordData } from './AchievementCheckerInterface';

/**
 * Unified facade for all achievement checking operations
 * Provides a single entry point for all achievement checks
 */
export class UnifiedAchievementChecker {
  /**
   * Check achievements related to workouts 
   */
  static async checkWorkoutAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return WorkoutCheckerService.checkWorkoutAchievements(userId);
  }

  /**
   * Check achievements related to streaks
   */
  static async checkStreakAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const checker = new StreakCheckerService();
    return checker.checkAchievements(userId);
  }

  /**
   * Check achievements related to personal records
   */
  static async checkPersonalRecordAchievements(
    userId: string,
    recordInfo?: PersonalRecordData
  ): Promise<ServiceResponse<string[]>> {
    return RecordCheckerService.checkPersonalRecordAchievements(userId, recordInfo);
  }

  /**
   * Check achievements related to XP milestones
   */
  static async checkXPAchievements(userId: string, totalXP?: number): Promise<ServiceResponse<string[]>> {
    return XPCheckerService.checkXPMilestoneAchievements(userId, totalXP);
  }

  /**
   * Check achievements related to activity variety
   */
  static async checkActivityVarietyAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return ActivityCheckerService.checkActivityVarietyAchievements(userId);
  }

  /**
   * Process a completed workout for all relevant achievements
   * This checks multiple achievement types in the right sequence
   */
  static async processCompletedWorkout(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const awardedAchievements: string[] = [];
        
        // Check workout achievements
        const workoutResult = await this.checkWorkoutAchievements(userId);
        if (workoutResult.success && workoutResult.data) {
          awardedAchievements.push(...workoutResult.data);
        }
        
        // Check streak achievements
        const streakResult = await this.checkStreakAchievements(userId);
        if (streakResult.success && streakResult.data) {
          awardedAchievements.push(...streakResult.data);
        }
        
        // Check activity variety achievements
        const varietyResult = await this.checkActivityVarietyAchievements(userId);
        if (varietyResult.success && varietyResult.data) {
          awardedAchievements.push(...varietyResult.data);
        }
        
        return awardedAchievements;
      },
      'PROCESS_COMPLETED_WORKOUT',
      { showToast: false }
    );
  }
}
