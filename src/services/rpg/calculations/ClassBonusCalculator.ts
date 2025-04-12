
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workout';
import { ClassBonusBreakdown } from '../types/classTypes';
import { GuerreiroBonus } from './class-bonuses/GuerreiroBonus';
import { MongeBonus } from './class-bonuses/MongeBonus';
import { NinjaBonus } from './class-bonuses/NinjaBonus';
import { BruxoBonus } from './class-bonuses/BruxoBonus';
import { PaladinoBonus } from './class-bonuses/PaladinoBonus';
import { mapToWorkoutExerciseData } from '@/utils/typeMappers';

/**
 * Service for calculating class-specific XP bonuses
 * Coordinates the individual class bonus calculators
 */
export class ClassBonusCalculator {
  /**
   * Apply class-specific bonuses to XP
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
    
    // Convert WorkoutExercise[] to WorkoutExerciseData[] for class bonus calculators
    const workoutData = {
      id: workout.id,
      exercises: workout.exercises.map(ex => mapToWorkoutExerciseData(ex)),
      durationSeconds: workout.durationSeconds,
      hasPR: workout.hasPR
    };
    
    // Apply class-specific bonuses by delegating to appropriate class calculator
    switch(userClass) {
      case 'Guerreiro': {
        const { bonusXP, bonusBreakdown: breakdown } = GuerreiroBonus.applyBonuses(baseXP, workoutData);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Monge': {
        const { bonusXP, bonusBreakdown: breakdown } = MongeBonus.applyBonuses(baseXP, workoutData, streak);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Ninja': {
        const { bonusXP, bonusBreakdown: breakdown } = NinjaBonus.applyBonuses(baseXP, workoutData);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Bruxo': {
        const { bonusXP, bonusBreakdown: breakdown } = BruxoBonus.applyBonuses(baseXP, workoutData);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Paladino': {
        const { bonusXP, bonusBreakdown: breakdown } = PaladinoBonus.applyBonuses(baseXP, workoutData);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
    }
    
    return { totalXP, bonusBreakdown };
  }
  
  /**
   * Check if Bruxo should preserve streak using the database
   */
  static async shouldPreserveStreak(userId: string, userClass: string | null): Promise<boolean> {
    if (!userId || userClass !== 'Bruxo') return false;
    return BruxoBonus.shouldPreserveStreak(userId);
  }
  
  /**
   * Calculate Paladino guild XP bonus
   * @returns Bonus multiplier (1.1 to 1.3)
   */
  static getPaladinoGuildBonus(userId: string, userClass: string | null, currentContribution: number): number {
    if (!userId || userClass !== 'Paladino') return 1.0;
    return PaladinoBonus.getGuildBonus(currentContribution);
  }
}
