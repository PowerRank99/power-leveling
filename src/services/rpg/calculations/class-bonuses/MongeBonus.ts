
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusCalculator } from '../ClassBonusCalculator';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { XPCalculationService } from '../../XPCalculationService';

/**
 * Monge class bonus calculator
 * - Força Interior: +20% XP from bodyweight exercises
 * - Discípulo do Algoritmo: +10% additional streak bonus
 */
export class MongeBonus {
  // Bonus percentages
  private static readonly BODYWEIGHT_BONUS = 0.2; // 20%
  private static readonly EXTRA_STREAK_BONUS = 0.1; // 10%
  
  static applyBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
    },
    streak: number
  ): { 
    bonusXP: number;
    bonusBreakdown: ClassBonusBreakdown[];
  } {
    let bonusXP = 0;
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    
    // Count calisthenics exercises
    const bodyweightExercises = workout.exercises.filter(ex => ex.type === 'Calistenia');
    const bodyweightCount = bodyweightExercises.length;
    
    if (bodyweightCount > 0) {
      // Calculate XP only for calisthenics exercises
      const exerciseXP = bodyweightCount * XPCalculationService.BASE_EXERCISE_XP;
      
      // Count completed sets only from calisthenics exercises
      const completedSets = bodyweightExercises.reduce((sum, ex) => {
        return sum + ex.sets.filter(set => set.completed).length;
      }, 0);
      
      const setXP = completedSets * XPCalculationService.BASE_SET_XP;
      
      // Apply the 20% bonus to calisthenics exercise and set XP only
      const bodyweightBonus = Math.round((exerciseXP + setXP) * this.BODYWEIGHT_BONUS);
      
      if (bodyweightBonus > 0) {
        console.log(`[MongeBonus] Calisthenics XP breakdown - Exercises: ${exerciseXP}, Sets: ${setXP}, Total bonus: ${bodyweightBonus}`);
        bonusXP += bodyweightBonus;
        bonusBreakdown.push({
          skill: 'Força Interior',
          amount: bodyweightBonus,
          description: `+${Math.round(this.BODYWEIGHT_BONUS * 100)}% XP de exercícios de calistenia`
        });
      }
    }
    
    // Discípulo do Algoritmo: +10% additional streak bonus 
    if (streak > 1) {
      const extraStreakBonus = Math.round(baseXP * this.EXTRA_STREAK_BONUS);
      bonusXP += extraStreakBonus;
      bonusBreakdown.push({
        skill: 'Discípulo do Algoritmo',
        amount: extraStreakBonus,
        description: `+${Math.round(this.EXTRA_STREAK_BONUS * 100)}% XP por manter sequência de treinos`
      });
    }
    
    return { bonusXP, bonusBreakdown };
  }
}
