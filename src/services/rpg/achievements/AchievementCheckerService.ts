
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import type { PersonalRecordData } from './AchievementCheckerInterface';

// Import specialized services 
import { WorkoutCheckerService } from './checkers/WorkoutCheckerService';
import { RecordCheckerService } from './checkers/RecordCheckerService';
import { StreakCheckerService } from './checkers/StreakCheckerService';
import { XPCheckerService } from './checkers/XPCheckerService';
import { ActivityCheckerService } from './checkers/ActivityCheckerService';

/**
 * Centralized service for checking and awarding achievements
 * Acts as a facade to delegate to specialized checkers
 */
export class AchievementCheckerService extends BaseAchievementChecker {
  /**
   * Implementation of abstract method from BaseAchievementChecker
   * This service doesn't directly check achievements but delegates to other checkers
   */
  async checkAchievements(userId: string, data?: any): Promise<ServiceResponse<string[]>> {
    const workoutChecker = new WorkoutCheckerService();
    return workoutChecker.checkAchievements(userId);
  }

  /**
   * Check all achievements relevant to workout completion
   */
  static async checkWorkoutRelatedAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const workoutChecker = new WorkoutCheckerService();
    return workoutChecker.checkAchievements(userId);
  }

  /**
   * Check all achievements related to personal records
   */
  static async checkPersonalRecordAchievements(
    userId: string,
    recordInfo?: PersonalRecordData
  ): Promise<ServiceResponse<string[]>> {
    const recordChecker = new RecordCheckerService();
    return recordChecker.checkAchievements(userId, recordInfo);
  }

  /**
   * Check all achievements related to streaks
   */
  static async checkStreakAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const streakChecker = new StreakCheckerService();
    return streakChecker.checkAchievements(userId);
  }

  /**
   * Check all achievements related to XP milestones
   */
  static async checkXPMilestoneAchievements(
    userId: string, 
    totalXP?: number
  ): Promise<ServiceResponse<string[]>> {
    const xpChecker = new XPCheckerService();
    return xpChecker.checkAchievements(userId, totalXP);
  }

  /**
   * Check activity variety achievements
   */
  static async checkActivityVarietyAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const activityChecker = new ActivityCheckerService();
    return activityChecker.checkAchievements(userId);
  }

  /**
   * Check for manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const activityChecker = new ActivityCheckerService();
    return activityChecker.checkAchievements(userId);
  }

  /**
   * Check a user's workout history for achievements
   */
  static async checkWorkoutHistoryAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const workoutChecker = new WorkoutCheckerService();
    return workoutChecker.checkAchievements(userId);
  }
}

// Re-export the PersonalRecordData interface to avoid circular dependencies
export type { PersonalRecordData };
