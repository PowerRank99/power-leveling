
/**
 * Core workout data types for the application
 */

/**
 * Interface for workout exercise data
 */
export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: WorkoutSet[];
  targetSets?: number;
  type?: string;
}

/**
 * Interface for workout set data
 */
export interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  set_order?: number;
  previous?: PreviousSetData;
  exercise_id?: string; // Added for compatibility with SetData
}

/**
 * Interface for database-formatted exercise data
 */
export interface WorkoutExerciseData {
  id: string;
  exercise_id: string;
  name: string;
  weight?: number;
  reps?: number;
  sets?: number;
  targetSets?: number;
  exerciseId?: string; // For backward compatibility
}

/**
 * Interface for set data
 */
export interface SetData {
  id: string;
  exercise_id: string;
  weight: string | number; // Support both string and number
  reps: string | number; // Support both string and number
  completed: boolean;
  set_order: number;
  previous?: PreviousSetData;
}

/**
 * Interface for previous set data
 */
export interface PreviousSetData {
  id: string;
  exercise_id: string;
  weight: string;
  reps: string;
  set_order: number;
}

/**
 * Interface for exercise history data
 */
export interface ExerciseHistory {
  id: string;
  user_id: string; // Snake case for database compatibility
  exercise_id: string; // Snake case for database compatibility
  weight: number;
  reps: number;
  sets: number;
  last_used_at: string; // Snake case for database compatibility
  createdAt?: string;
  userId?: string; // For backward compatibility
  exerciseId?: string; // For backward compatibility
  lastUsedAt?: string; // For backward compatibility
}

/**
 * Interface for database operation result
 */
export interface DatabaseResult<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

/**
 * Interface for personal record data
 */
export interface PersonalRecord {
  id?: string;
  user_id?: string;
  exercise_id: string;
  exercise_name: string;
  weight: number;
  previous_weight: number;
  recorded_at?: string;
}
