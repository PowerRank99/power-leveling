
import { WorkoutExercise } from '@/types/workoutTypes';
import { XP_CONSTANTS } from './constants/xpConstants';
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from './constants/exerciseTypes';
import { BaseXPCalculator } from './calculations/BaseXPCalculator';
import { ClassBonusCalculator } from './calculations/ClassBonusCalculator';

/**
 * Service responsible for XP calculations and constants
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
   */
  static getStreakMultiplier(streak: number): number {
    return BaseXPCalculator.getStreakMultiplier(streak);
  }
  
  /**
   * Calculate time-based XP with diminishing returns
   */
  static calculateTimeXP(durationMinutes: number): number {
    return BaseXPCalculator.calculateTimeXP(durationMinutes);
  }
  
  /**
   * Calculate XP for a completed workout with bonus breakdown
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
        return sum + ex.sets.filter(set => set.completed).length;
      }, 0);
      
      // Cap the number of sets that contribute to XP
      const cappedCompletedSets = Math.min(completedSets, this.MAX_XP_CONTRIBUTING_SETS);
      const setsXP = cappedCompletedSets * this.BASE_SET_XP; // 2 XP per completed set, max 10 sets
      
      // Sum base XP
      let baseXP = timeXP + exerciseXP + setsXP;
      
      // Apply difficulty modifier if available
      const workoutDifficulty = workout.difficulty || difficulty;
      if (workoutDifficulty in this.DIFFICULTY_MULTIPLIERS) {
        baseXP = Math.round(baseXP * this.DIFFICULTY_MULTIPLIERS[workoutDifficulty as keyof typeof this.DIFFICULTY_MULTIPLIERS]);
      }
      
      // Apply class-specific bonuses with breakdown
      const { totalXP, bonusBreakdown } = ClassBonusCalculator.applyClassBonuses(
        baseXP, 
        workout, 
        userClass, 
        streak
      );
      
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
   * This is now an async method that returns a Promise<boolean>
   */
  static async shouldPreserveStreak(userId: string, userClass: string | null): Promise<boolean> {
    return ClassBonusCalculator.shouldPreserveStreak(userId, userClass);
  }
  
  /**
   * Get guild contribution bonus multiplier (Paladino passive skill)
   */
  static getGuildContributionBonus(userId: string, userClass: string | null, contribution: number): number {
    return ClassBonusCalculator.getPaladinoGuildBonus(userId, userClass, contribution);
  }
}
