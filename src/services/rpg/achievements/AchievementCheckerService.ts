
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
  async checkAchievements(userId: string, data?: any): Promise<ServiceResponse<void>> {
    return AchievementCheckerService.checkWorkoutRelatedAchievements(userId);
  }

  /**
   * Check all achievements relevant to workout completion
   */
  static async checkWorkoutRelatedAchievements(userId: string): Promise<ServiceResponse<void>> {
    return WorkoutCheckerService.checkWorkoutAchievements(userId);
  }

  /**
   * Check all achievements related to personal records
   */
  static async checkPersonalRecordAchievements(
    userId: string,
    recordInfo?: PersonalRecordData
  ): Promise<ServiceResponse<void>> {
    return RecordCheckerService.checkPersonalRecordAchievements(userId, recordInfo);
  }

  /**
   * Check all achievements related to streaks
   */
  static async checkStreakAchievements(userId: string): Promise<ServiceResponse<void>> {
    return StreakCheckerService.checkStreakAchievements(userId);
  }

  /**
   * Check all achievements related to XP milestones
   */
  static async checkXPMilestoneAchievements(
    userId: string, 
    totalXP?: number
  ): Promise<ServiceResponse<void>> {
    return XPCheckerService.checkXPMilestoneAchievements(userId, totalXP);
  }

  /**
   * Check activity variety achievements
   */
  static async checkActivityVarietyAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ActivityCheckerService.checkActivityVarietyAchievements(userId);
  }

  /**
   * Check for manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ActivityCheckerService.checkManualWorkoutAchievements(userId);
  }

  /**
   * Check a user's workout history for achievements
   */
  static async checkWorkoutHistoryAchievements(userId: string): Promise<ServiceResponse<void>> {
    return WorkoutCheckerService.checkWorkoutHistoryAchievements(userId);
  }
}

// Re-export the PersonalRecordData interface to avoid circular dependencies
export type { PersonalRecordData };
