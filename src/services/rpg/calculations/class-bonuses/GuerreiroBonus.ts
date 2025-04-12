
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';

/**
 * Calculates Guerreiro class-specific bonuses
 */
export class GuerreiroBonus {
  /**
   * Apply Guerreiro-specific bonuses to XP
   */
  static applyBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      hasPR?: boolean;
    }
  ): { bonusXP: number; bonusBreakdown: ClassBonusBreakdown[] } {
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    let bonusXP = 0;
    
    const exerciseNames = workout.exercises.map(ex => ex.name.toLowerCase());
    
    // Check for compound lifts - Força Bruta
    const hasCompoundLifts = exerciseNames.some(name => 
      EXERCISE_TYPES.COMPOUND_LIFTS.some(lift => name.includes(lift))
    );
    
    if (hasCompoundLifts) {
      const compoundBonus = Math.round(baseXP * 0.20);
      bonusBreakdown.push({
        skill: CLASS_PASSIVE_SKILLS.GUERREIRO.PRIMARY,
        amount: compoundBonus,
        description: '+20% XP de exercícios compostos'
      });
      bonusXP += compoundBonus;
    }
    
    // PR bonus - Saindo da Jaula
    if (workout.hasPR) {
      const prBonus = Math.round(baseXP * 0.15);
      bonusBreakdown.push({
        skill: CLASS_PASSIVE_SKILLS.GUERREIRO.SECONDARY,
        amount: prBonus,
        description: '+15% XP por novo recorde pessoal'
      });
      bonusXP += prBonus;
    }
    
    return { bonusXP, bonusBreakdown };
  }
}
