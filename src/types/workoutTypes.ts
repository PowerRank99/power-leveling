
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
