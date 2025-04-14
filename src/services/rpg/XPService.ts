
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise, PersonalRecord } from '@/types/workoutTypes';
import { XPCalculationService } from './XPCalculationService';
import { PersonalRecordService } from './PersonalRecordService';
import { XPBonusService } from './XPBonusService';
import { PowerDayService } from './bonus/PowerDayService';
import { AchievementCheckerService } from './achievements/AchievementCheckerService';
import { mapToWorkoutExerciseData } from '@/utils/typeMappers';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { XPCalculationInput } from './types/xpTypes';
import { PassiveSkillService } from './bonus/PassiveSkillService';

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
    difficulty: 'iniciante' | 'intermediario' | 'avancado' = 'intermediario',
    userId?: string
  ) {
    // Pass workout data as an object to XPCalculationService
    const input: XPCalculationInput = {
      workout,
      userClass,
      streak,
      defaultDifficulty: workout.difficulty || difficulty,
      userId
    };
    
    return XPCalculationService.calculateWorkoutXP(input);
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
   * 
   * @param userId - The ID of the user to award XP to
   * @param amount - The amount of XP to award
   * @param source - The source of the XP (e.g., 'workout', 'achievement')
   * @param metadata - Optional metadata about the XP award (for logging/debugging)
   */
  static async awardXP(
    userId: string, 
    amount: number, 
    source: string = 'workout',
    metadata?: any
  ): Promise<boolean> {
    try {
      if (!userId) {
        console.error('awardXP: No userId provided');
        return false;
      }
      
      let finalAmount = amount;
      const isAchievementXP = source === 'achievement';
      
      // Get user class for bonuses
      const { data: profile } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', userId)
        .single();
      
      const userClass = profile?.class;
      
      // Apply class-specific bonuses
      if (source === 'workout' && userClass === 'Druida') {
        // Apply Druida's Cochilada Mística bonus if applicable
        finalAmount = await XPCalculationService.applyDruidaRestBonus(userId, userClass, finalAmount);
      }
      
      const result = await XPBonusService.awardXP(userId, finalAmount, isAchievementXP);
      
      // Check for XP milestone achievements using the unified checker
      if (result) {
        await AchievementCheckerService.checkXPMilestoneAchievements(userId);
      }
      
      return result;
    } catch (error) {
      console.error('Error in awardXP:', error);
      return false;
    }
  }
  
  /**
   * Awards points for an achievement with class bonuses
   * 
   * @param userId - The ID of the user to award points to
   * @param points - The base amount of points to award
   */
  static async awardAchievementPoints(
    userId: string, 
    points: number
  ): Promise<boolean> {
    try {
      if (!userId) {
        console.error('awardAchievementPoints: No userId provided');
        return false;
      }
      
      // Get user's class
      const { data: profile } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', userId)
        .single();
      
      const userClass = profile?.class;
      
      // Apply Bruxo's Topo da Montanha bonus if applicable
      let finalPoints = points;
      if (userClass === 'Bruxo') {
        finalPoints = await XPCalculationService.applyAchievementPointsBonus(userId, userClass, points);
      }
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          achievement_points: supabase.rpc('increment', { 
            row_id: userId,
            table: 'profiles',
            column: 'achievement_points',
            value: finalPoints
          })
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Error awarding achievement points:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in awardAchievementPoints:', error);
      return false;
    }
  }
  
  /**
   * Update streak with Bruxo's Pijama Arcano logic
   * 
   * @param userId - User ID
   * @param userClass - User's class
   * @param daysMissed - Number of days missed
   * @param currentStreak - Current streak value
   * @returns New streak value
   */
  static async updateStreakWithPassives(
    userId: string,
    userClass: string | null,
    daysMissed: number,
    currentStreak: number
  ): Promise<number> {
    // For Bruxo using Pijama Arcano, streak reduces by 5% per day instead of resetting
    if (userClass === 'Bruxo' && daysMissed > 0) {
      const reductionFactor = await XPCalculationService.getStreakReductionFactor(userId, userClass, daysMissed);
      
      if (reductionFactor > 0) {
        // Apply gradual reduction
        return Math.max(0, Math.floor(currentStreak * reductionFactor));
      }
    }
    
    // For other classes, streak resets
    return 0;
  }
}
