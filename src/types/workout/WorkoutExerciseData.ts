
/**
 * Interface representing workout exercise data with properties formatted for database operations
 */
export interface WorkoutExerciseData {
  id: string;
  exercise_id: string;
  name?: string;
  weight?: number;
  reps?: number;
  sets?: number;
  targetSets?: number;
  type?: string;
  level?: string;
  difficulty?: string;
}

/**
 * Interface for an exercise with both normalized and database property names
 */
export interface NormalizedExerciseData {
  id: string;
  exercise_id?: string;
  exerciseId?: string;
  name: string;
  type?: string;
  level?: string;
  weight?: number;
  reps?: number;
  sets?: number;
  targetSets?: number;
  target_sets?: number;
  is_completed?: boolean;
  isCompleted?: boolean;
}
