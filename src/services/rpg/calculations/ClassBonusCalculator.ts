
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../types/classTypes';
import { GuerreiroBonus } from './class-bonuses/GuerreiroBonus';
import { MongeBonus } from './class-bonuses/MongeBonus';
import { NinjaBonus } from './class-bonuses/NinjaBonus';
import { BruxoBonus } from './class-bonuses/BruxoBonus';
import { PaladinoBonus } from './class-bonuses/PaladinoBonus';
import { XPCalculationInput } from '../types/xpTypes';

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
   * @param baseXP - Base XP amount before class bonuses
   * @param workout - Workout data including exercises and duration
   * @param userClass - User's selected class (Guerreiro, Monge, etc.)
   * @param streak - Current streak count in days
   * @returns Total XP after applying class bonuses and breakdown of bonuses applied
   */
  static applyClassBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      hasPR?: boolean;
    },
    userClass?: string | null,
    streak: number = 0
  ): { totalXP: number, bonusBreakdown: ClassBonusBreakdown[] } {
    if (!userClass) return { totalXP: baseXP, bonusBreakdown: [] };
    
    let totalXP = baseXP;
    let bonusBreakdown: ClassBonusBreakdown[] = [];
    
    // Apply class-specific bonuses by delegating to appropriate class calculator
    switch(userClass) {
      case 'Guerreiro': {
        const { bonusXP, bonusBreakdown: breakdown } = GuerreiroBonus.applyBonuses(baseXP, workout);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Monge': {
        const { bonusXP, bonusBreakdown: breakdown } = MongeBonus.applyBonuses(baseXP, workout, streak);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Ninja': {
        const { bonusXP, bonusBreakdown: breakdown } = NinjaBonus.applyBonuses(baseXP, workout);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Bruxo': {
        const { bonusXP, bonusBreakdown: breakdown } = BruxoBonus.applyBonuses(baseXP, workout);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Paladino': {
        const { bonusXP, bonusBreakdown: breakdown } = PaladinoBonus.applyBonuses(baseXP, workout);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
      
      // Note: Druida implementation will be added in a future update
    }
    
    return { totalXP, bonusBreakdown };
  }
  
  /**
   * Check if Bruxo should preserve streak using the database
   * 
   * @param userId - User ID to check
   * @param userClass - User's selected class
   * @returns Boolean indicating if streak should be preserved
   */
  static async shouldPreserveStreak(userId: string, userClass: string | null): Promise<boolean> {
    if (!userId || userClass !== 'Bruxo') return false;
    return BruxoBonus.shouldPreserveStreak(userId);
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
