
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise, PersonalRecord } from '@/types/workoutTypes';
import { XPCalculationService } from './XPCalculationService';
import { PersonalRecordService } from './PersonalRecordService';
import { XPBonusService } from './XPBonusService';
import { PowerDayService } from './bonus/PowerDayService';
import { AchievementCheckerService } from './achievements/AchievementCheckerService';
import { mapToWorkoutExerciseData } from '@/utils/typeMappers';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';

/**
 * Main XP Service that coordinates XP calculations and awards
 */
export class XPService {
  // Re-export constants for backward compatibility
  static readonly DAILY_XP_CAP = XPCalculationService.DAILY_XP_CAP;
  static readonly PR_BONUS_XP = XPCalculationService.PR_BONUS_XP;
  static readonly BASE_EXERCISE_XP = XPCalculationService.BASE_EXERCISE_XP;
  static readonly BASE_SET_XP = XPCalculationService.BASE_SET_XP;
  static readonly DIFFICULTY_MULTIPLIERS = XPCalculationService.DIFFICULTY_MULTIPLIERS;
  static readonly TIME_XP_TIERS = XPCalculationService.TIME_XP_TIERS;
  
  // Power Day constants (2x/week can exceed 300 XP cap up to 500 XP)
  static readonly POWER_DAY_CAP = PowerDayService.POWER_DAY_CAP;
  static readonly MANUAL_WORKOUT_BASE_XP = 100; // Updated to 100
  
  /**
   * Calculate XP for a completed workout
   * Now returns the full breakdown object instead of just the total XP number
   */
  static calculateWorkoutXP(
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      difficulty?: 'iniciante' | 'intermediario' | 'avancado'
    },
    userClass?: string | null,
    streak: number = 0,
    difficulty: 'iniciante' | 'intermediario' | 'avancado' = 'intermediario'
  ): {
    totalXP: number;
    baseXP: number;
    bonusBreakdown: { skill: string, amount: number, description: string }[];
  } {
    // Pass workout data directly to XPCalculationService using the correct properties
    return XPCalculationService.calculateWorkoutXP(
      workout,
      userClass,
      streak,
      workout.difficulty || difficulty
    );
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
    const result = await PersonalRecordService.checkForPersonalRecords(userId, workout);
    if (result.success) {
      return result.data;
    }
    return [];
  }
  
  /**
   * Awards XP to a user and updates their level if necessary
   */
  static async awardXP(
    userId: string, 
    baseXP: number, 
    source: string = 'workout',
    metadata?: any
  ): Promise<boolean> {
    try {
      if (!userId) {
        console.error('awardXP: No userId provided');
        return false;
      }
      
      const isAchievementXP = source === 'achievement';
      const result = await XPBonusService.awardXP(userId, baseXP, isAchievementXP);
      
      // Check for XP milestone achievements using the unified checker
      if (result) {
        await AchievementCheckerService.checkXPMilestoneAchievements(userId, baseXP);
      }
      
      return result;
    } catch (error) {
      console.error('Error in awardXP:', error);
      return false;
    }
  }
  
  /**
   * Awards XP for a completed workout
   */
  static async awardWorkoutXP(
    userId: string,
    workout: any,
    durationSeconds: number
  ): Promise<boolean> {
    try {
      // Calculate base XP from workout
      let baseXP = 100; // Default XP
      
      if (workout && durationSeconds) {
        const workoutObj = {
          id: workout.id,
          exercises: [],
          durationSeconds: durationSeconds,
          difficulty: workout.difficulty || 'intermediario'
        };
        
        // Get the full breakdown now
        const xpData = this.calculateWorkoutXP(workoutObj, null, 0);
        baseXP = xpData.totalXP;
      }
      
      // Award the XP
      return await this.awardXP(userId, baseXP, 'workout');
    } catch (error) {
      console.error('Error in awardWorkoutXP:', error);
      return false;
    }
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
    return PowerDayService.checkPowerDayAvailability(userId);
  }
  
  /**
   * Record a power day usage
   */
  static async recordPowerDayUsage(userId: string, week: number, year: number): Promise<boolean> {
    return PowerDayService.recordPowerDayUsage(userId, week, year);
  }
}
