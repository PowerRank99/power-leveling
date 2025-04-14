
import { EXERCISE_TYPES } from '../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';

/**
 * Service for classifying exercises by type to determine class-specific bonuses
 */
export class ExerciseTypeClassifier {
  /**
   * Check if an exercise qualifies for Guerreiro bonus
   */
  static isGuerreiroExercise(exercise: WorkoutExercise): boolean {
    const name = exercise.name?.toLowerCase() || '';
    return EXERCISE_TYPES.COMPOUND_LIFTS.some(keyword => name.includes(keyword));
  }
  
  /**
   * Check if an exercise qualifies for Monge bonus
   */
  static isMongeExercise(exercise: WorkoutExercise): boolean {
    const name = exercise.name?.toLowerCase() || '';
    return EXERCISE_TYPES.BODYWEIGHT.some(keyword => name.includes(keyword));
  }
  
  /**
   * Check if an exercise qualifies for Ninja bonus
   */
  static isNinjaExercise(exercise: WorkoutExercise): boolean {
    const name = exercise.name?.toLowerCase() || '';
    return EXERCISE_TYPES.CARDIO_HIIT.some(keyword => name.includes(keyword));
  }
  
  /**
   * Check if an exercise qualifies for Paladino bonus
   */
  static isPaladinoExercise(exercise: WorkoutExercise): boolean {
    const name = exercise.name?.toLowerCase() || '';
    return EXERCISE_TYPES.SPORTS.some(keyword => name.includes(keyword));
  }
  
  /**
   * Check if an exercise qualifies for Druida bonus
   */
  static isDruidaExercise(exercise: WorkoutExercise): boolean {
    const name = exercise.name?.toLowerCase() || '';
    return EXERCISE_TYPES.MOBILITY.some(keyword => name.includes(keyword));
  }
  
  /**
   * Count qualifying exercises for a class
   */
  static countQualifyingExercises(
    exercises: WorkoutExercise[], 
    checkFunction: (exercise: WorkoutExercise) => boolean
  ): number {
    return exercises.filter(exercise => checkFunction(exercise)).length;
  }
  
  /**
   * Count qualifying sets for a class
   */
  static countQualifyingSets(
    exercises: WorkoutExercise[],
    checkFunction: (exercise: WorkoutExercise) => boolean
  ): number {
    return exercises
      .filter(exercise => checkFunction(exercise))
      .reduce((total, exercise) => {
        const completedSets = exercise.sets?.filter(set => set.completed)?.length || 0;
        return total + completedSets;
      }, 0);
  }
}
