
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusCalculator } from '../ClassBonusCalculator';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { XPCalculationService } from '../../XPCalculationService';

/**
 * Ninja class bonus calculator
 * - Forrest Gump: +20% XP from cardio exercises
 * - HIIT & Run: +40% XP bonus from time in workouts under 45 minutes
 */
export class NinjaBonus {
  // Bonus percentages
  private static readonly CARDIO_BONUS = 0.2; // 20%
  private static readonly SHORT_WORKOUT_BONUS = 0.4; // 40%
  private static readonly SHORT_WORKOUT_THRESHOLD = 45; // 45 minutes
  
  static applyBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
    }
  ): { 
    bonusXP: number;
    bonusBreakdown: ClassBonusBreakdown[];
  } {
    let bonusXP = 0;
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    
    // Forrest Gump: +20% XP directly on exercise and set XP parts for cardio exercises
    const cardioExercises = workout.exercises.filter(
      ex => ex.type === 'Cardio'
    );
    
    if (cardioExercises.length > 0) {
      // Calculate the exercise and set XP parts only
      const exerciseXP = workout.exercises.length * XPCalculationService.BASE_EXERCISE_XP;
      
      // Count completed sets
      const completedSets = workout.exercises.reduce((sum, ex) => {
        return sum + ex.sets.filter(set => set.completed).length;
      }, 0);
      
      const setXP = completedSets * XPCalculationService.BASE_SET_XP;
      
      // Apply the flat 20% bonus to exercise and set XP
      const cardioBonus = Math.round((exerciseXP + setXP) * this.CARDIO_BONUS);
      
      if (cardioBonus > 0) {
        bonusXP += cardioBonus;
        bonusBreakdown.push({
          skill: 'Forrest Gump',
          amount: cardioBonus,
          description: `+${Math.round(this.CARDIO_BONUS * 100)}% XP de exercícios de cardio`
        });
      }
    }
    
    // HIIT & Run: +40% XP bonus from time-based XP in workouts under 45 minutes
    const durationMinutes = workout.durationSeconds / 60;
    if (durationMinutes < this.SHORT_WORKOUT_THRESHOLD) {
      // Calculate time-based XP only
      const timeXP = XPCalculationService.calculateTimeXP(durationMinutes);
      
      // Apply 40% bonus to time-based XP
      const timeBonus = Math.round(timeXP * this.SHORT_WORKOUT_BONUS);
      bonusXP += timeBonus;
      bonusBreakdown.push({
        skill: 'HIIT & Run',
        amount: timeBonus,
        description: `+${Math.round(this.SHORT_WORKOUT_BONUS * 100)}% XP por treino rápido (<45min)`
      });
    }
    
    return { bonusXP, bonusBreakdown };
  }
}
