import { XP_CONSTANTS } from '../constants/xpConstants';
import { XPTimeTier, XPComponents } from '../types/xpTypes';
import { WorkoutExercise } from '@/types/workoutTypes';

/**
 * Core XP calculation service that handles basic XP computations
 * Responsible for time-based XP and streak multipliers
 */
export class BaseXPCalculator {
  /**
   * Calculate the streak multiplier (5% per day up to 35% at 7 days)
   * 
   * @param streak - Current streak count in days
   * @returns Multiplier as a decimal (e.g., 1.35 for 35% bonus)
   */
  static getStreakMultiplier(streak: number): number {
    const maxStreakBonus = XP_CONSTANTS.MAX_STREAK_DAYS;
    const bonusPerDay = XP_CONSTANTS.STREAK_BONUS_PER_DAY;
    const streakDays = Math.min(streak, maxStreakBonus);
    return 1 + (streakDays * bonusPerDay);
  }
  
  /**
   * Calculate time-based XP with diminishing returns
   * First 30 minutes: 40 XP
   * 30-60 minutes: +30 XP
   * 60-90 minutes: +20 XP
   * Beyond 90 minutes: no additional XP
   * 
   * @param durationMinutes - Workout duration in minutes
   * @returns XP amount for the time component
   */
  static calculateTimeXP(durationMinutes: number): number {
    let totalXP = 0;
    
    // Create time brackets for a more readable approach
    const brackets: XPTimeTier[] = XP_CONSTANTS.TIME_XP_TIERS;
    
    let remainingMinutes = durationMinutes;
    let previousBracketEnd = 0;
    
    for (const bracket of brackets) {
      // Calculate how many minutes fit in this bracket
      const minutesInBracket = Math.min(
        Math.max(0, remainingMinutes), 
        bracket.minutes - previousBracketEnd
      );
      
      if (minutesInBracket > 0) {
        // Apply proportional XP based on how many minutes in this bracket
        const bracketXP = (minutesInBracket / (bracket.minutes - previousBracketEnd)) * bracket.xp;
        totalXP += bracketXP;
      }
      
      remainingMinutes -= (bracket.minutes - previousBracketEnd);
      previousBracketEnd = bracket.minutes;
      
      if (remainingMinutes <= 0 || bracket.minutes === Infinity) break;
    }
    
    return Math.round(totalXP);
  }
  
  /**
   * Calculate XP components (time, exercises, sets) separately
   * This allows for targeted class bonuses
   * 
   * @param workout - Workout data with exercises and duration
   * @param difficulty - Workout difficulty level
   * @returns XP components breakdown
   */
  static calculateXPComponents(
    workout: {
      exercises: WorkoutExercise[];
      durationSeconds: number;
    },
    difficulty: string = 'intermediario'
  ): XPComponents {
    // Calculate time-based XP
    const timeMinutes = Math.floor(workout.durationSeconds / 60);
    const timeXP = this.calculateTimeXP(timeMinutes);
    
    // Calculate exercise completion XP
    const exerciseXP = workout.exercises.length * XP_CONSTANTS.BASE_EXERCISE_XP;
    
    // Calculate set completion XP
    const completedSets = workout.exercises.reduce((sum, ex) => {
      if (Array.isArray(ex.sets)) {
        return sum + ex.sets.filter(set => set.completed).length;
      }
      return sum;
    }, 0);
    
    // Cap sets XP at maximum allowed
    const cappedCompletedSets = Math.min(completedSets, XP_CONSTANTS.MAX_XP_CONTRIBUTING_SETS);
    const setsXP = cappedCompletedSets * XP_CONSTANTS.BASE_SET_XP;
    
    // Apply difficulty modifier to exercise and set XP only
    const difficultyMultiplier = 
      XP_CONSTANTS.DIFFICULTY_MULTIPLIERS[difficulty as keyof typeof XP_CONSTANTS.DIFFICULTY_MULTIPLIERS] || 1.0;
    
    const adjustedExerciseXP = Math.round(exerciseXP * difficultyMultiplier);
    const adjustedSetsXP = Math.round(setsXP * difficultyMultiplier);
    
    // Return all components
    return {
      timeXP,
      exerciseXP: adjustedExerciseXP,
      setsXP: adjustedSetsXP,
      prBonus: 0, // Will be added later if applicable
      totalBaseXP: timeXP + adjustedExerciseXP + adjustedSetsXP
    };
  }
}
