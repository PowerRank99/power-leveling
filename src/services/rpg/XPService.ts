
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';
import { XPCalculationService } from './XPCalculationService';
import { PersonalRecordService, PersonalRecord } from './PersonalRecordService';
import { XPBonusService } from './XPBonusService';
import { PowerDayService } from './bonus/PowerDayService';
import { AchievementService } from './AchievementService';

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
    streak: number = 0,
    difficulty: 'iniciante' | 'intermediario' | 'avancado' = 'intermediario'
  ): number {
    const result = XPCalculationService.calculateWorkoutXP(workout, userClass, streak, difficulty);
    return result.totalXP; // Return just the totalXP number instead of the full object
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
   */
  static async awardXP(
    userId: string, 
    baseXP: number, 
    source: string = 'workout',
    metadata?: any
  ): Promise<boolean> {
    const isAchievementXP = source === 'achievement';
    const result = await XPBonusService.awardXP(userId, baseXP, isAchievementXP);
    
    // Check for XP milestone achievements
    if (result) {
      await XPService.checkXPMilestoneAchievements(userId);
    }
    
    return result;
  }
  
  /**
   * Check for XP milestone achievements
   */
  private static async checkXPMilestoneAchievements(userId: string): Promise<void> {
    try {
      // Get user's current XP
      const { data, error } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', userId)
        .single();
        
      if (error || !data) {
        console.error('Error fetching user XP:', error);
        return;
      }
      
      const totalXP = data.xp || 0;
      
      // Award XP milestone achievements
      if (totalXP >= 1000) {
        await AchievementService.awardAchievement(userId, 'xp-1000');
      }
      if (totalXP >= 5000) {
        await AchievementService.awardAchievement(userId, 'xp-5000');
      }
      if (totalXP >= 10000) {
        await AchievementService.awardAchievement(userId, 'xp-10000');
      }
      if (totalXP >= 50000) {
        await AchievementService.awardAchievement(userId, 'xp-50000');
      }
      if (totalXP >= 100000) {
        await AchievementService.awardAchievement(userId, 'xp-100000');
      }
      
    } catch (error) {
      console.error('Error checking XP milestone achievements:', error);
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
        
        baseXP = this.calculateWorkoutXP(workoutObj, null, 0);
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
   * Record a power day usage
   */
  static async recordPowerDayUsage(userId: string, week: number, year: number): Promise<boolean> {
    return PowerDayService.recordPowerDayUsage(userId, week, year);
  }
}
