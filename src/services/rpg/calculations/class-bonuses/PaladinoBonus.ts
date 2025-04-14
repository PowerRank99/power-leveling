
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { XPComponents } from '../../types/xpTypes';
import { ExerciseTypeClassifier } from '../ExerciseTypeClassifier';

/**
 * Calculates Paladino class-specific bonuses
 */
export class PaladinoBonus {
  /**
   * Apply Paladino-specific bonuses to XP
   */
  static applyBonuses(
    components: XPComponents,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
    },
    isQualifyingExercise: (exercise: WorkoutExercise) => boolean
  ): { bonusXP: number; bonusBreakdown: ClassBonusBreakdown[] } {
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    let bonusXP = 0;
    
    // Calculate number of qualifying exercises (Sports type)
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
      
      // Apply 40% bonus to qualifying XP
      const sportsBonus = Math.round(totalQualifyingXP * 0.40);
      
      if (sportsBonus > 0) {
        bonusBreakdown.push({
          skill: CLASS_PASSIVE_SKILLS.PALADINO.PRIMARY,
          amount: sportsBonus,
          description: '+40% XP de atividades esportivas'
        });
        bonusXP += sportsBonus;
      }
    }
    
    // Guild XP contribution bonus - Camisa 10
    // This is handled separately but we add to breakdown for display
    bonusBreakdown.push({
      skill: CLASS_PASSIVE_SKILLS.PALADINO.SECONDARY,
      amount: 0,
      description: '+10% para contribuição de XP de guild (até 30%)'
    });
    
    return { bonusXP, bonusBreakdown };
  }
  
  /**
   * Calculate Paladino guild XP bonus
   * @returns Bonus multiplier (1.1 to 1.3)
   */
  static getGuildBonus(currentContribution: number): number {
    // Base bonus is 10%, can stack up to 3 times based on contribution level
    const stackLevel = Math.min(Math.floor(currentContribution / 1000), 3);
    return 1.0 + (stackLevel * 0.1);
  }
}
