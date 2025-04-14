
import { ExerciseHistory, WorkoutExercise, WorkoutExerciseData, SetData, WorkoutSet, DatabaseResult } from '@/types/workout';

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
    createdAt: record.created_at,
    // Add backward compatibility fields
    userId: record.user_id,
    exerciseId: record.exercise_id,
    lastUsedAt: record.last_used_at
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

/**
 * Converts a SetData to WorkoutSet for type compatibility
 */
export function mapSetDataToWorkoutSet(setData: SetData): WorkoutSet {
  return {
    id: setData.id,
    weight: setData.weight.toString(),
    reps: setData.reps.toString(),
    completed: setData.completed,
    set_order: setData.set_order,
    exercise_id: setData.exercise_id,
    previous: setData.previous
  };
}

/**
 * Converts WorkoutSet to SetData for database operations
 */
export function mapWorkoutSetToSetData(set: WorkoutSet): SetData {
  return {
    id: set.id,
    exercise_id: set.exercise_id || '', // Default to empty string if missing
    weight: set.weight,
    reps: set.reps,
    completed: set.completed,
    set_order: set.set_order || 0, // Default to 0 if missing
    previous: set.previous
  };
}

/**
 * Ensures a DatabaseResult has all required properties
 */
export function createDatabaseResult<T>(result: Partial<DatabaseResult<T>>): DatabaseResult<T> {
  return {
    data: result.data || null,
    error: result.error || null,
    success: result.success !== undefined ? result.success : !result.error
  };
}
