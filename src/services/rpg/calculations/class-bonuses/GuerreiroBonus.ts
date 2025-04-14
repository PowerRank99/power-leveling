
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { XPComponents } from '../../types/xpTypes';
import { ExerciseTypeClassifier } from '../ExerciseTypeClassifier';

/**
 * Calculates Guerreiro class-specific bonuses
 */
export class GuerreiroBonus {
  /**
   * Apply Guerreiro-specific bonuses to XP
   */
  static applyBonuses(
    components: XPComponents,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      hasPR?: boolean;
    },
    isQualifyingExercise: (exercise: WorkoutExercise) => boolean
  ): { bonusXP: number; bonusBreakdown: ClassBonusBreakdown[] } {
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    let bonusXP = 0;
    
    // Calculate number of qualifying exercises (Musculação type)
    const qualifyingExercisesCount = ExerciseTypeClassifier.countQualifyingExercises(
      workout.exercises, 
      isQualifyingExercise
    );
    
    // Calculate completed sets from qualifying exercises
    const qualifyingSetsCount = ExerciseTypeClassifier.countQualifyingSets(
      workout.exercises,
      isQualifyingExercise
    );
    
    // Only apply bonus if there are qualifying exercises
    if (qualifyingExercisesCount > 0) {
      // Calculate exercise XP that qualifies for the bonus
      const qualifyingExerciseXP = qualifyingExercisesCount * 5; // 5 XP per exercise
      
      // Calculate sets XP that qualifies for the bonus (capped at MAX_XP_CONTRIBUTING_SETS)
      const cappedQualifyingSets = Math.min(qualifyingSetsCount, 10); // Cap at 10 sets
      const qualifyingSetsXP = cappedQualifyingSets * 2; // 2 XP per set
      
      // Calculate total qualifying XP
      const totalQualifyingXP = qualifyingExerciseXP + qualifyingSetsXP;
      
      // Apply 20% bonus to qualifying XP
      const strengthBonus = Math.round(totalQualifyingXP * 0.20);
      
      if (strengthBonus > 0) {
        bonusBreakdown.push({
          skill: CLASS_PASSIVE_SKILLS.GUERREIRO.PRIMARY,
          amount: strengthBonus,
          description: '+20% XP de exercícios de força'
        });
        bonusXP += strengthBonus;
      }
    }
    
    // PR bonus - Saindo da Jaula
    if (workout.hasPR) {
      const prBonus = Math.round(components.prBonus * 0.15);
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
