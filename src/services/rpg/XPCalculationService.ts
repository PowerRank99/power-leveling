import { WorkoutExercise } from '@/types/workoutTypes';
import { XP_CONSTANTS } from './constants/xpConstants';
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from './constants/exerciseTypes';
import { BaseXPCalculator } from './calculations/BaseXPCalculator';
import { ClassBonusCalculator } from './calculations/ClassBonusCalculator';
import { 
  XPCalculationInput, 
  XPCalculationResult, 
  WorkoutDifficulty 
} from './types/xpTypes';
import { PassiveSkillService } from './bonus/PassiveSkillService';

/**
 * Central service for coordinating XP calculations across the application
 * Acts as a facade for various specialized calculators while maintaining
 * backward compatibility with older implementations
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
   */
  static calculateWorkoutXP({
    workout,
    userClass = null,
    streak = 0,
    defaultDifficulty = 'intermediario',
    userId
  }: XPCalculationInput): XPCalculationResult {
    try {
      // Get workout difficulty
      const workoutDifficulty = workout.difficulty || defaultDifficulty;
      
      // Calculate XP components (time, exercises, sets)
      const components = BaseXPCalculator.calculateXPComponents(
        workout, 
        workoutDifficulty
      );
      
      // Add PR bonus if applicable
      if (workout.hasPR) {
        components.prBonus = this.PR_BONUS_XP;
        components.totalBaseXP += components.prBonus;
      }
      
      // Create a bonusBreakdown array to track all bonuses
      let bonusBreakdown: { skill: string, amount: number, description: string }[] = [];
      
      // Apply streak multiplier
      const streakMultiplier = this.getStreakMultiplier(streak);
      let streakBonusXP = 0;
      
      if (streak > 0) {
        streakBonusXP = Math.round(components.totalBaseXP * (streakMultiplier - 1));
        bonusBreakdown.push({
          skill: 'Streak',
          amount: streakBonusXP,
          description: `+${(streakMultiplier - 1) * 100}% XP (${streak}-day streak)`
        });
      }
      
      // Add streak bonus to XP
      let totalXPAfterStreak = components.totalBaseXP + streakBonusXP;
      
      // Apply class-specific bonuses with breakdown
      const { totalXP, bonusBreakdown: classBonusBreakdown } = ClassBonusCalculator.applyClassBonuses(
        components,
        workout, 
        userClass, 
        streak,
        userId
      );
      
      // Combine the bonusBreakdown arrays
      bonusBreakdown = [...bonusBreakdown, ...classBonusBreakdown];
      
      // Cap at daily maximum
      const cappedXP = Math.min(totalXP, this.DAILY_XP_CAP);
      
      return {
        totalXP: cappedXP,
        baseXP: components.totalBaseXP,
        bonusBreakdown,
        components
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
   * Check if Bruxo should preserve partial streak using Pijama Arcano
   */
  static async getStreakReductionFactor(userId: string, userClass: string | null, daysMissed: number): Promise<number> {
    return PassiveSkillService.getStreakReductionFactor(userId, userClass, daysMissed);
  }
  
  /**
   * Apply Bruxo's achievement points bonus
   */
  static async applyAchievementPointsBonus(userId: string, userClass: string | null, basePoints: number): Promise<number> {
    return PassiveSkillService.applyAchievementPointsBonus(userId, userClass, basePoints);
  }
  
  /**
   * Apply Druida's rest XP bonus
   */
  static async applyDruidaRestBonus(userId: string, userClass: string | null, baseXP: number): Promise<number> {
    return PassiveSkillService.applyDruidaRestBonus(userId, userClass, baseXP);
  }
  
  /**
   * Get guild contribution bonus multiplier (Paladino passive skill)
   */
  static getGuildContributionBonus(userId: string, userClass: string | null, contribution: number): number {
    return ClassBonusCalculator.getPaladinoGuildBonus(userId, userClass, contribution);
  }
}
