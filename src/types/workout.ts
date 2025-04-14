
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
  previous?: {
    weight: string;
    reps: string;
  };
}

/**
 * Interface for database-formatted exercise data
 */
export interface WorkoutExerciseData {
  id: string;
  exercise_id: string;
  name: string;
}

/**
 * Interface for set data
 */
export interface SetData {
  id: string;
  exercise_id: string;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  set_order: number;
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
  user_id: string;
  exercise_id: string;
  weight: number;
  reps: number;
  sets: number;
  last_used_at: string;
}

/**
 * Interface for database operation result
 */
export interface DatabaseResult<T> {
  data: T | null;
  error: Error | null;
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
