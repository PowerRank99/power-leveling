
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
    
    // Força Interior: +20% XP directly on exercise and set XP parts for bodyweight exercises
    const bodyweightExercises = workout.exercises.filter(
      ex => ex.type === 'Calistenia'
    );
    
    if (bodyweightExercises.length > 0) {
      // Calculate the exercise and set XP parts only
      const exerciseXP = workout.exercises.length * XPCalculationService.BASE_EXERCISE_XP;
      
      // Count completed sets
      const completedSets = workout.exercises.reduce((sum, ex) => {
        return sum + ex.sets.filter(set => set.completed).length;
      }, 0);
      
      const setXP = completedSets * XPCalculationService.BASE_SET_XP;
      
      // Apply the flat 20% bonus to exercise and set XP
      const bodyweightBonus = Math.round((exerciseXP + setXP) * this.BODYWEIGHT_BONUS);
      
      if (bodyweightBonus > 0) {
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
