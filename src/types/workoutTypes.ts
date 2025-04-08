
// Core data types for workout management
export interface SetData {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  previous?: PreviousSetData;
  set_order: number; // Always include set_order for consistent ordering
}

export interface PreviousSetData {
  weight: string;
  reps: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: Array<SetData>;
}

export interface WorkoutData {
  id: string;
  exercises: WorkoutExercise[];
}

// Database operation results
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: any;
}

// New exercise history types
export interface ExerciseHistory {
  id: string;
  user_id: string;
  exercise_id: string;
  weight: number;
  reps: number;
  sets: number;
  last_used_at: string;
  created_at: string;
}

export interface ExerciseHistoryMap {
  [exerciseId: string]: ExerciseHistory;
}
