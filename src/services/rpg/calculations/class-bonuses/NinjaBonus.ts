
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS } from '../../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../../types/classTypes';
import { XPComponents } from '../../types/xpTypes';
import { ExerciseTypeClassifier } from '../ExerciseTypeClassifier';

/**
 * Calculates Ninja class-specific bonuses
 */
export class NinjaBonus {
  /**
   * Apply Ninja-specific bonuses to XP
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
    
    // Calculate number of qualifying exercises (Cardio type)
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
      const cardioBonus = Math.round(totalQualifyingXP * 0.20);
      
      if (cardioBonus > 0) {
        bonusBreakdown.push({
          skill: CLASS_PASSIVE_SKILLS.NINJA.PRIMARY,
          amount: cardioBonus,
          description: '+20% XP de exercícios de cardio'
        });
        bonusXP += cardioBonus;
      }
    }
    
    // HIIT & Run bonus for short workouts
    const workoutMinutes = Math.floor(workout.durationSeconds / 60);
    if (workoutMinutes <= 45) {
      // 40% bonus on time XP for workouts under 45 minutes
      const timeBonus = Math.round(components.timeXP * 0.40);
      
      if (timeBonus > 0) {
        bonusBreakdown.push({
          skill: CLASS_PASSIVE_SKILLS.NINJA.SECONDARY,
          amount: timeBonus,
          description: '+40% XP para treinos rápidos (≤ 45 min)'
        });
        bonusXP += timeBonus;
      }
    }
    
    return { bonusXP, bonusBreakdown };
  }
}
