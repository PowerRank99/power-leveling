export interface PreviousSetData {
  weight: string;
  reps: string;
}

export interface SetData {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  previous?: PreviousSetData;
  set_order?: number; // Added this property to fix errors
}

export interface WorkoutExercise {
  exerciseId: string;
  weight?: number;
  reps?: number;
  sets?: number;
  targetSets?: number;
}

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number;
  exerciseId?: string;
  exerciseName?: string;
}

// Add ExerciseHistory interface to fix import errors
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

// Add DatabaseResult type to fix import errors
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: any;
}
