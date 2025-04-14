
/**
 * Common workout types for the application
 */

import { 
  WorkoutExercise,
  WorkoutSet,
  WorkoutExerciseData,
  SetData,
  PreviousSetData,
  ExerciseHistory,
  DatabaseResult,
  PersonalRecord
} from './workout';

// Re-export with more descriptive naming
export type {
  WorkoutExercise,
  WorkoutSet, 
  WorkoutExerciseData,
  SetData,
  PreviousSetData,
  ExerciseHistory,
  DatabaseResult,
  PersonalRecord
};

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
