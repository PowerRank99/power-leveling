
import { WorkoutExercise } from '@/types/workoutTypes';
import { XPCalculationService } from './XPCalculationService';
import { PersonalRecordService, PersonalRecord } from './PersonalRecordService';
import { XPBonusService } from './XPBonusService';
import { PowerDayService } from './bonus/PowerDayService';
import { ProfileXPService } from './bonus/ProfileXPService';
import { isTestingMode } from '@/config/testingMode';

/**
 * Main XP Service that coordinates XP calculations and awards
 */
export class XPService {
  // Re-export constants for backward compatibility
  static readonly DAILY_XP_CAP = XPCalculationService.DAILY_XP_CAP;
  static readonly PR_BONUS_XP = XPCalculationService.PR_BONUS_XP;
  static readonly BASE_EXERCISE_XP = XPCalculationService.BASE_EXERCISE_XP;
  static readonly BASE_SET_XP = XPCalculationService.BASE_SET_XP;
  static readonly TIME_XP_TIERS = XPCalculationService.TIME_XP_TIERS;
  
  // Power Day constants (2x/week can exceed 300 XP cap up to 500 XP)
  static readonly POWER_DAY_CAP = PowerDayService.POWER_DAY_CAP;
  static readonly MANUAL_WORKOUT_BASE_XP = 100; // Updated to 100
  
  /**
   * Calculate XP for a completed workout
   * Returns a number instead of an object
   */
  static calculateWorkoutXP(
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      difficulty?: 'iniciante' | 'intermediario' | 'avancado'
    },
    userClass?: string | null,
    streak: number = 0
  ): number {
    const result = XPCalculationService.calculateWorkoutXP(workout, userClass, streak);
    
    if (isTestingMode()) {
      console.log('🔧 Testing mode: No XP cap applied');
      return result.totalXP;
    }
    
    // Apply cap in non-testing mode
    return Math.min(result.totalXP, PowerDayService.POWER_DAY_CAP);
  }
  
  /**
   * Calculate time-based XP with diminishing returns
   */
  static calculateTimeXP(durationMinutes: number): number {
    return XPCalculationService.calculateTimeXP(durationMinutes);
  }
  
  /**
   * Check for personal records
   */
  static async checkForPersonalRecords(
    userId: string, 
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      difficulty?: 'iniciante' | 'intermediario' | 'avancado'
    }
  ): Promise<PersonalRecord[]> {
    return PersonalRecordService.checkForPersonalRecords(userId, workout);
  }
  
  /**
   * Awards XP to a user and updates their level if necessary
   * This also handles daily XP tracking and Power Day functionality
   */
  static async awardXP(
    userId: string, 
    baseXP: number, 
    personalRecords: PersonalRecord[] = []
  ): Promise<boolean> {
    // First, reset daily XP if it's a new day
    await ProfileXPService.resetDailyXPIfNeeded(userId);
    
    if (isTestingMode()) {
      console.log('🔧 Testing mode: Awarding uncapped XP:', baseXP);
    }
    
    return XPBonusService.awardXP(userId, baseXP, personalRecords);
  }
  
  /**
   * Helper method for getting streak multiplier
   */
  static getStreakMultiplier(streak: number): number {
    return XPCalculationService.getStreakMultiplier(streak);
  }
  
  /**
   * Check if a user has Power Day availability
   * Returns information about power day usage for the current week
   */
  static async checkPowerDayAvailability(userId: string): Promise<{
    available: boolean;
    used: number;
    max: number;
    week: number;
    year: number;
  }> {
    try {
      return await PowerDayService.checkPowerDayAvailability(userId);
    } catch (error) {
      console.error('Error in checkPowerDayAvailability:', error);
      return {
        available: false,
        used: 0,
        max: 2,
        week: 0,
        year: 0
      };
    }
  }
  
  /**
   * Check if a user meets the requirements for a Power Day
   */
  static async checkPowerDayEligibility(userId: string): Promise<{
    eligible: boolean;
    reason: string;
  }> {
    return PowerDayService.checkPowerDayEligibility(userId);
  }
  
  /**
   * Record a power day usage
   */
  static async recordPowerDayUsage(userId: string, week: number, year: number): Promise<boolean> {
    return PowerDayService.recordPowerDayUsage(userId, week, year);
  }
  
  /**
   * Get human-readable explanation of Power Day requirements
   */
  static getPowerDayRequirementsText(): string {
    return PowerDayService.getPowerDayRequirementsText();
  }
}
