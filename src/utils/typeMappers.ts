
import { ExerciseHistory, WorkoutExercise, WorkoutExerciseData, SetData } from '@/types/workoutTypes';

/**
 * Utility functions to map between database objects and TypeScript interfaces
 */

/**
 * Maps a database exercise history record to the ExerciseHistory interface
 */
export function mapToExerciseHistory(record: any): ExerciseHistory {
  return {
    id: record.id,
    userId: record.user_id,
    exerciseId: record.exercise_id,
    weight: record.weight,
    reps: record.reps,
    sets: record.sets,
    lastUsedAt: record.last_used_at,
    createdAt: record.created_at
  };
}

/**
 * Maps a WorkoutExerciseData object to WorkoutExercise
 */
export function mapToWorkoutExercise(data: WorkoutExerciseData, sets: SetData[] = []): WorkoutExercise {
  return {
    id: data.id || `temp-${data.exerciseId}`, // Ensure id is always available
    name: data.name || `Exercise ${data.exerciseId.slice(0, 8)}`, // Fallback name
    exerciseId: data.exerciseId,
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
    exerciseId: exercise.exerciseId,
    weight: exercise.sets?.[0] ? parseFloat(exercise.sets[0].weight) : undefined,
    reps: exercise.sets?.[0] ? parseInt(exercise.sets[0].reps) : undefined,
    sets: completedSets,
    targetSets: exercise.targetSets,
    name: exercise.name
  };
}
