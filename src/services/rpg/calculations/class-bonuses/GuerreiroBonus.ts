
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusCalculator } from '../ClassBonusCalculator';
import { ClassBonusBreakdown } from '../../types/classTypes';

/**
 * Guerreiro class bonus calculator
 * - Força Bruta: +20% XP from weight training exercises
 * - Saindo da Jaula: +10% XP for workouts with Personal Records
 */
export class GuerreiroBonus {
  // Bonus percentages
  private static readonly WEIGHT_TRAINING_BONUS = 0.2; // 20%
  private static readonly PR_BONUS = 0.1; // 10%
  
  static applyBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      hasPR?: boolean;
    }
  ): { 
    bonusXP: number;
    bonusBreakdown: ClassBonusBreakdown[];
  } {
    let bonusXP = 0;
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    
    // Força Bruta: +20% XP for weight training exercises
    const weightTrainingExercises = workout.exercises.filter(
      ex => ex.type === 'Musculação'
    );
    
    if (weightTrainingExercises.length > 0) {
      // Calculate percentage of weight training exercises
      const weightTrainingRatio = weightTrainingExercises.length / workout.exercises.length;
      const weightTrainingBonus = Math.round(baseXP * this.WEIGHT_TRAINING_BONUS * weightTrainingRatio);
      
      if (weightTrainingBonus > 0) {
        bonusXP += weightTrainingBonus;
        bonusBreakdown.push({
          skill: 'Força Bruta',
          amount: weightTrainingBonus,
          description: `+${Math.round(this.WEIGHT_TRAINING_BONUS * 100)}% XP de exercícios de musculação`
        });
      }
    }
    
    // Saindo da Jaula: +10% XP for workouts with Personal Records
    if (workout.hasPR) {
      const prBonus = Math.round(baseXP * this.PR_BONUS);
      bonusXP += prBonus;
      bonusBreakdown.push({
        skill: 'Saindo da Jaula',
        amount: prBonus,
        description: `+${Math.round(this.PR_BONUS * 100)}% XP por bater recorde pessoal`
      });
    }
    
    return { bonusXP, bonusBreakdown };
  }
}
