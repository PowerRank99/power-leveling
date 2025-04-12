
/**
 * @deprecated These types are deprecated in favor of the consolidated types in src/types/workout.ts
 * Please import from src/types/workout.ts instead.
 */

// Re-export from workout.ts to maintain backward compatibility
export type {
  PreviousSetData,
  SetData,
  WorkoutExerciseData as WorkoutExercise,
  TimerState,
  ExerciseHistory,
  DatabaseResult
} from './workout';
