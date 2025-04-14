
import { ExerciseHistory, WorkoutExercise, WorkoutExerciseData, SetData, WorkoutSet } from '@/types/workout';

/**
 * Utility functions to map between database objects and TypeScript interfaces
 */

/**
 * Maps a database exercise history record to the ExerciseHistory interface
 */
export function mapToExerciseHistory(record: any): ExerciseHistory {
  return {
    id: record.id,
    user_id: record.user_id,
    exercise_id: record.exercise_id,
    weight: record.weight,
    reps: record.reps,
    sets: record.sets,
    last_used_at: record.last_used_at,
    createdAt: record.created_at
  };
}

/**
 * Maps a WorkoutExerciseData object to WorkoutExercise
 */
export function mapToWorkoutExercise(data: WorkoutExerciseData, sets: WorkoutSet[] = []): WorkoutExercise {
  return {
    id: data.id || `temp-${data.exercise_id}`, // Ensure id is always available
    name: data.name || `Exercise ${data.exercise_id.slice(0, 8)}`, // Fallback name
    exerciseId: data.exercise_id,
    sets: sets,
    targetSets: data.targetSets
  };
}

/**
 * Maps a WorkoutExercise to WorkoutExerciseData
 * Used for backward compatibility with old code
 */
export function mapToWorkoutExerciseData(exercise: WorkoutExercise): WorkoutExerciseData {
  // Count completed sets
  const completedSets = Array.isArray(exercise.sets) 
    ? exercise.sets.filter(set => set.completed).length 
    : 0;
    
  return {
    id: exercise.id,
    exercise_id: exercise.exerciseId,
    weight: exercise.sets?.[0] ? parseFloat(exercise.sets[0].weight.toString()) : undefined,
    reps: exercise.sets?.[0] ? parseInt(exercise.sets[0].reps.toString()) : undefined,
    sets: completedSets,
    targetSets: exercise.targetSets,
    name: exercise.name
  };
}
