
import { WorkoutExercise } from '@/types/workoutTypes';
import { XP_CONSTANTS } from './constants/xpConstants';
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from './constants/exerciseTypes';
import { BaseXPCalculator } from './calculations/BaseXPCalculator';
import { ClassBonusCalculator } from './calculations/ClassBonusCalculator';

/**
 * Service responsible for XP calculations and constants
 * Acts as a facade for the various calculation services
 */
export class XPCalculationService {
  // Re-export constants for backward compatibility
  static readonly DAILY_XP_CAP = XP_CONSTANTS.DAILY_XP_CAP;
  static readonly PR_BONUS_XP = XP_CONSTANTS.PR_BONUS_XP;
  static readonly BASE_EXERCISE_XP = XP_CONSTANTS.BASE_EXERCISE_XP;
  static readonly BASE_SET_XP = XP_CONSTANTS.BASE_SET_XP;
  static readonly DIFFICULTY_MULTIPLIERS = XP_CONSTANTS.DIFFICULTY_MULTIPLIERS;
  static readonly TIME_XP_TIERS = XP_CONSTANTS.TIME_XP_TIERS;
  static readonly EXERCISE_TYPES = EXERCISE_TYPES;
  static readonly CLASS_PASSIVE_SKILLS = CLASS_PASSIVE_SKILLS;
  static readonly MAX_XP_CONTRIBUTING_SETS = XP_CONSTANTS.MAX_XP_CONTRIBUTING_SETS;
  
  /**
   * Calculate the streak multiplier (5% per day up to 35% at 7 days)
   * Delegates to BaseXPCalculator
   */
  static getStreakMultiplier(streak: number): number {
    return BaseXPCalculator.getStreakMultiplier(streak);
  }
  
  /**
   * Calculate time-based XP with diminishing returns
   * Delegates to BaseXPCalculator
   */
  static calculateTimeXP(durationMinutes: number): number {
    return BaseXPCalculator.calculateTimeXP(durationMinutes);
  }
  
  /**
   * Calculate XP for a completed workout with bonus breakdown
   * Orchestrates the XP calculation process using various calculators
   * 
   * @param workout - Workout data including exercises, duration, and difficulty
   * @param userClass - User's selected class (Guerreiro, Monge, etc.)
   * @param streak - Current streak count in days
   * @param difficulty - Workout difficulty level
   * @returns Total XP, base XP, and breakdown of all bonuses applied
   */
  static calculateWorkoutXP(
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      difficulty?: 'iniciante' | 'intermediario' | 'avancado';
      hasPR?: boolean;
    },
    userClass?: string | null,
    streak: number = 0,
    difficulty: 'iniciante' | 'intermediario' | 'avancado' = 'intermediario'
  ): {
    totalXP: number;
    baseXP: number;
    bonusBreakdown: { skill: string, amount: number, description: string }[];
  } {
    try {
      // Calculate time-based XP with diminishing returns
      const timeMinutes = Math.floor((workout.durationSeconds || 0) / 60);
      const timeXP = this.calculateTimeXP(timeMinutes);
      
      // Exercise completion XP
      const exerciseXP = workout.exercises.length * this.BASE_EXERCISE_XP; // 5 XP per exercise
      
      // Set completion XP - capped at MAX_XP_CONTRIBUTING_SETS sets (10 by default)
      const completedSets = workout.exercises.reduce((sum, ex) => {
        // Check if sets is an array and has a filter method
        if (Array.isArray(ex.sets)) {
          return sum + ex.sets.filter(set => set.completed).length;
        }
        return sum;
      }, 0);
      
      // Cap the number of sets that contribute to XP
      const cappedCompletedSets = Math.min(completedSets, this.MAX_XP_CONTRIBUTING_SETS);
      const setsXP = cappedCompletedSets * this.BASE_SET_XP; // 2 XP per completed set, max 10 sets
      
      // Personal Record bonus if applicable
      const prBonus = workout.hasPR ? this.PR_BONUS_XP : 0;
      
      // Sum base XP
      let baseXP = timeXP + exerciseXP + setsXP + prBonus;
      
      // Apply difficulty modifier if available
      const workoutDifficulty = workout.difficulty || difficulty;
      if (workoutDifficulty in this.DIFFICULTY_MULTIPLIERS) {
        baseXP = Math.round(baseXP * this.DIFFICULTY_MULTIPLIERS[workoutDifficulty as keyof typeof this.DIFFICULTY_MULTIPLIERS]);
      }
      
      // Create a bonusBreakdown array to track all bonuses
      let bonusBreakdown: { skill: string, amount: number, description: string }[] = [];
      
      // First apply streak multiplier
      const streakMultiplier = this.getStreakMultiplier(streak);
      let streakBonusXP = 0;
      
      if (streak > 0) {
        streakBonusXP = Math.round(baseXP * (streakMultiplier - 1));
        bonusBreakdown.push({
          skill: 'Streak',
          amount: streakBonusXP,
          description: `+${(streakMultiplier - 1) * 100}% XP (${streak}-day streak)`
        });
      }
      
      // Add streak bonus to XP
      let totalXPAfterStreak = baseXP + streakBonusXP;
      
      // Apply class-specific bonuses with breakdown
      const { totalXP, bonusBreakdown: classBonusBreakdown } = ClassBonusCalculator.applyClassBonuses(
        totalXPAfterStreak, 
        workout, 
        userClass, 
        streak
      );
      
      // Combine the bonusBreakdown arrays
      bonusBreakdown = [...bonusBreakdown, ...classBonusBreakdown];
      
      // Cap at daily maximum
      const cappedXP = Math.min(totalXP, this.DAILY_XP_CAP);
      
      return {
        totalXP: cappedXP,
        baseXP,
        bonusBreakdown
      };
    } catch (error) {
      console.error('Error calculating workout XP:', error);
      return {
        totalXP: 50, // Default XP on error
        baseXP: 50,
        bonusBreakdown: []
      };
    }
  }
  
  /**
   * Should preserve streak (Bruxo passive skill)
   * Delegates to ClassBonusCalculator
   */
  static async shouldPreserveStreak(userId: string, userClass: string | null): Promise<boolean> {
    return ClassBonusCalculator.shouldPreserveStreak(userId, userClass);
  }
  
  /**
   * Get guild contribution bonus multiplier (Paladino passive skill)
   * Delegates to ClassBonusCalculator
   */
  static getGuildContributionBonus(userId: string, userClass: string | null, contribution: number): number {
    return ClassBonusCalculator.getPaladinoGuildBonus(userId, userClass, contribution);
  }
}
