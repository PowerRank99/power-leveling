
/**
 * Common workout types for the application
 * These types now directly reference src/types/workout.ts for consistency
 */

import { 
  WorkoutExercise as WorkoutExerciseBase,
  WorkoutSet as WorkoutSetBase,
  WorkoutExerciseData as WorkoutExerciseDataBase,
  SetData as SetDataBase,
  PreviousSetData as PreviousSetDataBase,
  ExerciseHistory as ExerciseHistoryBase,
  DatabaseResult as DatabaseResultBase,
  PersonalRecord as PersonalRecordBase
} from './workout';

// Re-export with more descriptive naming
export type WorkoutExercise = WorkoutExerciseBase;
export type WorkoutSet = WorkoutSetBase;
export type WorkoutExerciseData = WorkoutExerciseDataBase;
export type SetData = SetDataBase;
export type PreviousSetData = PreviousSetDataBase;
export type ExerciseHistory = ExerciseHistoryBase;
export type DatabaseResult<T> = DatabaseResultBase<T>;
export type PersonalRecord = PersonalRecordBase;

/**
 * Additional type definitions for workout module
 */

export interface Routine {
  id: string;
  name: string;
  exercises_count?: number;
  last_used_at?: string | null;
  created_at?: string;
}

export interface RecentWorkout {
  id: string;
  name: string;
  date: string;
  exercises_count: number;
  sets_count: number;
  prs: number;
  duration_seconds: number | null;
}
