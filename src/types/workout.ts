export interface PersonalRecord {
  id?: string;
  userId?: string;
  user_id?: string;
  exerciseId?: string;
  exercise_id?: string;
  exerciseName?: string;
  recordedAt?: string;
  recorded_at?: string;
  weight: number;
  previous_weight?: number;
  previousWeight?: number;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  exerciseId: string;
  sets: WorkoutSet[];
  targetSets?: number;
}

export interface WorkoutSet {
  id: string;
  exercise_id?: string;
  weight: string;  // Explicitly string to match database
  reps: string;    // Explicitly string to match database
  completed: boolean;
  set_order?: number;
  previous?: PreviousSetData;
}

export interface PreviousSetData {
  id: string;
  exercise_id: string;
  weight: string;
  reps: string;
  set_order: number;
}

export interface WorkoutExerciseData {
  id: string;
  exercise_id: string;
  name?: string;
  weight?: number | string;
  reps?: number | string;
  sets?: number;
  targetSets?: number;
  type?: string;
}

export interface SetData {
  id: string;
  exercise_id: string;
  weight: string;
  reps: string;
  completed: boolean;
  set_order: number;
  previous?: PreviousSetData;
}

export interface ExerciseHistory {
  id: string;
  user_id: string;
  userId?: string;
  exercise_id: string;
  exerciseId?: string;
  weight: number | string;
  reps: number | string;
  sets: number;
  last_used_at: string;
  lastUsedAt?: string;
  createdAt?: string;
}

/**
 * Standardized response type for database operations
 */
export interface DatabaseResult<T> {
  success: boolean;
  data: T | null;
  error: Error | null;
  code?: string;
  details?: any;
}
