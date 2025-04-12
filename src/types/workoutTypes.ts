
/**
 * Common workout types for the application
 */

export interface WorkoutExercise {
  id: string;
  name: string;
  exerciseId: string; // Making exerciseId required
  sets: WorkoutSet[];
  targetSets?: number;
  targetReps?: string;
}

export interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  set_order?: number;
  completed_at?: string | null;
  previous?: {
    weight: string;
    reps: string;
  };
}

export interface WorkoutExerciseData {
  id: string; // Making id required
  exerciseId: string;
  weight?: number;
  reps?: number;
  sets?: number;
  targetSets?: number;
  name?: string;
}

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

// Add these additional types that were missing and causing errors
export interface SetData {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  previous?: {
    weight: string;
    reps: string;
  };
  set_order?: number;
}

export interface ExerciseHistory {
  id: string;
  userId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  sets: number;
  lastUsedAt: string;
  createdAt: string;
}

export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: any;
}

export interface PreviousSetData {
  weight: string;
  reps: string;
}
