
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../types/classTypes';
import { GuerreiroBonus } from './class-bonuses/GuerreiroBonus';
import { MongeBonus } from './class-bonuses/MongeBonus';
import { NinjaBonus } from './class-bonuses/NinjaBonus';
import { BruxoBonus } from './class-bonuses/BruxoBonus';
import { PaladinoBonus } from './class-bonuses/PaladinoBonus';
import { DruidaBonus } from './class-bonuses/DruidaBonus';
import { XPCalculationInput, XPComponents } from '../types/xpTypes';
import { ExerciseTypeClassifier } from './ExerciseTypeClassifier';

/**
 * Service that coordinates class-specific XP bonus calculations
 * Uses the Strategy pattern to delegate calculations to specialized class calculators
 * 
 * Class-specific bonuses are calculated based on:
 * - Workout type and exercises
 * - User's current streak
 * - Personal records
 * - Time-based conditions
 */
export class ClassBonusCalculator {
  /**
   * Apply class-specific bonuses to XP
   * 
   * @param components - XP components breakdown (time, exercises, sets)
   * @param workout - Workout data including exercises and duration
   * @param userClass - User's selected class (Guerreiro, Monge, etc.)
   * @param streak - Current streak count in days
   * @returns Total XP after applying class bonuses and breakdown of bonuses applied
   */
  static applyClassBonuses(
    components: XPComponents,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      hasPR?: boolean;
    },
    userClass?: string | null,
    streak: number = 0,
    userId?: string
  ): { totalXP: number, bonusBreakdown: ClassBonusBreakdown[] } {
    if (!userClass) return { totalXP: components.totalBaseXP, bonusBreakdown: [] };
    
    let totalXP = components.totalBaseXP;
    let bonusBreakdown: ClassBonusBreakdown[] = [];
    
    // Apply class-specific bonuses by delegating to appropriate class calculator
    switch(userClass) {
      case 'Guerreiro': {
        const { bonusXP, bonusBreakdown: breakdown } = GuerreiroBonus.applyBonuses(
          components,
          workout,
          ExerciseTypeClassifier.isGuerreiroExercise
        );
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Monge': {
        const { bonusXP, bonusBreakdown: breakdown } = MongeBonus.applyBonuses(
          components,
          workout,
          streak,
          ExerciseTypeClassifier.isMongeExercise
        );
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Ninja': {
        const { bonusXP, bonusBreakdown: breakdown } = NinjaBonus.applyBonuses(
          components,
          workout,
          ExerciseTypeClassifier.isNinjaExercise
        );
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Bruxo': {
        const { bonusXP, bonusBreakdown: breakdown } = BruxoBonus.applyBonuses(
          components,
          workout
        );
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Paladino': {
        const { bonusXP, bonusBreakdown: breakdown } = PaladinoBonus.applyBonuses(
          components,
          workout,
          ExerciseTypeClassifier.isPaladinoExercise
        );
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Druida': {
        const { bonusXP, bonusBreakdown: breakdown } = DruidaBonus.applyBonuses(
          components,
          workout,
          userId,
          ExerciseTypeClassifier.isDruidaExercise
        );
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
    }
    
    return { totalXP, bonusBreakdown };
  }
  
  /**
   * Get streak reduction factor for Bruxo using Pijama Arcano
   * 
   * @param userId - User ID to check
   * @param userClass - User's selected class
   * @param daysMissed - Number of days missed
   * @returns Factor to multiply streak by (0-1)
   */
  static async getStreakReductionFactor(
    userId: string, 
    userClass: string | null, 
    daysMissed: number
  ): Promise<number> {
    if (!userId || userClass !== 'Bruxo' || daysMissed <= 0) return 0;
    return BruxoBonus.getStreakReductionFactor(daysMissed);
  }
  
  /**
   * Apply bonus to achievement points for Bruxo using Topo da Montanha
   * 
   * @param userId - User ID to check
   * @param userClass - User's selected class
   * @param basePoints - Base achievement points
   * @returns Modified achievement points
   */
  static async applyAchievementPointsBonus(
    userId: string, 
    userClass: string | null, 
    basePoints: number
  ): Promise<number> {
    if (!userId || userClass !== 'Bruxo') return basePoints;
    
    const shouldApplyBonus = await BruxoBonus.shouldApplyAchievementBonus(userId);
    if (shouldApplyBonus) {
      return Math.round(basePoints * 1.5); // 50% bonus
    }
    
    return basePoints;
  }
  
  /**
   * Apply Druida's rest bonus using Cochilada Mística
   * 
   * @param userId - User ID to check
   * @param userClass - User's selected class
   * @param baseXP - Base XP amount
   * @returns Modified XP amount
   */
  static async applyDruidaRestBonus(
    userId: string, 
    userClass: string | null, 
    baseXP: number
  ): Promise<number> {
    if (!userId || userClass !== 'Druida') return baseXP;
    
    const { applyBonus, multiplier } = await DruidaBonus.shouldApplyRestBonus(userId);
    if (applyBonus) {
      return Math.round(baseXP * multiplier);
    }
    
    return baseXP;
  }
  
  /**
   * Calculate Paladino guild XP bonus
   * 
   * @param userId - User ID
   * @param userClass - User's selected class
   * @param currentContribution - Current guild contribution level
   * @returns Bonus multiplier (1.1 to 1.3)
   */
  static getPaladinoGuildBonus(userId: string, userClass: string | null, currentContribution: number): number {
    if (!userId || userClass !== 'Paladino') return 1.0;
    return PaladinoBonus.getGuildBonus(currentContribution);
  }
}
