import { WorkoutExercise } from '@/types/workoutTypes';
import { EXERCISE_TYPES } from '../constants/exerciseTypes';

/**
 * Service for classifying exercises by type to determine which class bonuses apply
 */
export class ExerciseTypeClassifier {
  /**
   * Check if an exercise qualifies for a Guerreiro bonus
   * @param exercise The exercise to check
   * @returns True if the exercise should receive Guerreiro bonus
   */
  static isGuerreiroExercise(exercise: WorkoutExercise): boolean {
    return (exercise as any).type === 'Musculação';
  }
  
  /**
   * Check if an exercise qualifies for a Monge bonus
   * @param exercise The exercise to check
   * @returns True if the exercise should receive Monge bonus
   */
  static isMongeExercise(exercise: WorkoutExercise): boolean {
    const exerciseName = exercise.name.toLowerCase();
    return (exercise as any).type === 'Calistenia' ||
           EXERCISE_TYPES.BODYWEIGHT.some(term => exerciseName.includes(term));
  }
  
  /**
   * Check if an exercise qualifies for a Ninja bonus
   * @param exercise The exercise to check
   * @returns True if the exercise should receive Ninja bonus
   */
  static isNinjaExercise(exercise: WorkoutExercise): boolean {
    const exerciseName = exercise.name.toLowerCase();
    return (exercise as any).type === 'Cardio' ||
           EXERCISE_TYPES.CARDIO_HIIT.some(term => exerciseName.includes(term));
  }
  
  /**
   * Check if an exercise qualifies for a Druida bonus
   * @param exercise The exercise to check
   * @returns True if the exercise should receive Druida bonus
   */
  static isDruidaExercise(exercise: WorkoutExercise): boolean {
    const exerciseName = exercise.name.toLowerCase();
    return (exercise as any).type === 'Flexibilidade & Mobilidade' ||
           EXERCISE_TYPES.MOBILITY.some(term => exerciseName.includes(term));
  }
  
  /**
   * Check if an exercise qualifies for a Paladino bonus
   * @param exercise The exercise to check
   * @returns True if the exercise should receive Paladino bonus
   */
  static isPaladinoExercise(exercise: WorkoutExercise): boolean {
    const exerciseName = exercise.name.toLowerCase();
    return (exercise as any).type === 'Esportes' ||
           EXERCISE_TYPES.SPORTS.some(term => exerciseName.includes(term));
  }
  
  /**
   * Count the number of exercises qualifying for a specific class bonus
   * @param exercises Array of exercises
   * @param classBonusChecker Function to check if exercise qualifies
   * @returns Number of qualifying exercises
   */
  static countQualifyingExercises(
    exercises: WorkoutExercise[],
    classBonusChecker: (exercise: WorkoutExercise) => boolean
  ): number {
    return exercises.filter(classBonusChecker).length;
  }
  
  /**
   * Calculate the total sets from qualifying exercises
   * @param exercises Array of exercises
   * @param classBonusChecker Function to check if exercise qualifies
   * @returns Total number of sets from qualifying exercises
   */
  static countQualifyingSets(
    exercises: WorkoutExercise[],
    classBonusChecker: (exercise: WorkoutExercise) => boolean
  ): number {
    return exercises
      .filter(classBonusChecker)
      .reduce((sum, ex) => {
        if (Array.isArray(ex.sets)) {
          return sum + ex.sets.filter(set => set.completed).length;
        }
        return sum;
      }, 0);
  }
}
