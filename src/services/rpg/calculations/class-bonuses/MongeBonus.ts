
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { XP_CONSTANTS } from '../../constants/xpConstants';
import { XPComponents } from '../../types/xpTypes';
import { ExerciseTypeClassifier } from '../ExerciseTypeClassifier';

/**
 * Calculates Monge class-specific bonuses
 */
export class MongeBonus {
  /**
   * Apply Monge-specific bonuses to XP
   */
  static applyBonuses(
    components: XPComponents,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
    },
    streak: number = 0,
    isQualifyingExercise: (exercise: WorkoutExercise) => boolean
  ): { bonusXP: number; bonusBreakdown: ClassBonusBreakdown[] } {
    const bonusBreakdown: ClassBonusBreakdown[] = [];
    let bonusXP = 0;
    
    // Calculate number of qualifying exercises (Calistenia type)
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
      const bodyweightBonus = Math.round(totalQualifyingXP * 0.20);
      
      if (bodyweightBonus > 0) {
        bonusBreakdown.push({
          skill: CLASS_PASSIVE_SKILLS.MONGE.PRIMARY,
          amount: bodyweightBonus,
          description: '+20% XP de exercícios com peso corporal'
        });
        bonusXP += bodyweightBonus;
      }
    }
    
    // Additional streak bonus - Discípulo do Algoritmo
    // FIX: The Monk gets an additional 10 percentage points to the streak bonus (not 10% of the bonus)
    if (streak > 0) {
      // Calculate the additional 10 percentage points
      const additionalStreakPercentage = 0.10; // 10 percentage points additional
      const additionalStreakBonus = Math.round(components.totalBaseXP * additionalStreakPercentage);
      
      if (additionalStreakBonus > 0) {
        bonusBreakdown.push({
          skill: CLASS_PASSIVE_SKILLS.MONGE.SECONDARY,
          amount: additionalStreakBonus,
          description: '+10 pontos percentuais no bônus de sequência'
        });
        bonusXP += additionalStreakBonus;
      }
    }
    
    return { bonusXP, bonusBreakdown };
  }
}
