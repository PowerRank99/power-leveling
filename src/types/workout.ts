
/**
 * Consolidated workout types for the entire application
 */

/**
 * Base workout interface with common properties
 */
export interface BaseWorkout {
  id: string;
  userId: string;
  routineId?: string | null;
  startedAt: string;
  completedAt?: string | null;
  durationSeconds?: number | null;
}

/**
 * Represents a single exercise set
 */
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

/**
 * Represents an exercise within a workout
 */
export interface WorkoutExercise {
  id: string;
  name: string;
  exerciseId: string; // Changed from optional to required for compatibility
  sets: WorkoutSet[];
  targetSets?: number; // From workout routine
  targetReps?: string; // From workout routine
}

/**
 * Represents data for workout exercises coming from the database
 * This maintains backward compatibility with existing code
 */
export interface WorkoutExerciseData {
  exerciseId: string;
  weight?: number;
  reps?: number;
  sets?: number;
  targetSets?: number;
  id?: string;
  name?: string;
}

/**
 * Complete workout session with exercises
 */
export interface WorkoutSession extends BaseWorkout {
  exercises: WorkoutExercise[];
  notes?: Record<string, string>; // Exercise ID to notes
}

/**
 * For displaying workout history/summary
 */
export interface WorkoutSummary {
  id: string;
  name: string;
  date: string;
  workoutDate: string; // ISO string for sorting
  exercisesCount: number;
  setsCount: number;
  prs: number;
  durationSeconds: number | null;
  type: 'tracked';
}

/**
 * For manual workout entries
 */
export interface ManualWorkout {
  id: string;
  date: string;
  workoutDate: string; // ISO string for sorting
  type: 'manual';
  description: string | null;
  activityType: string | null;
  photoUrl: string;
  xpAwarded: number;
  isPowerDay: boolean;
}

/**
 * Union type for workout history display
 */
export type UnifiedWorkout = WorkoutSummary | ManualWorkout;

/**
 * Exercise history for a user
 */
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

/**
 * Previous set data (simple version for reuse)
 */
export interface PreviousSetData {
  weight: string;
  reps: string;
}

/**
 * Set data for use in components (maintains compatibility)
 */
export interface SetData {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  previous?: PreviousSetData;
  set_order?: number;
}

/**
 * Personal record for an exercise
 */
export interface PersonalRecord {
  exerciseId: string;
  weight: number;
  previousWeight: number;
}

/**
 * Timer state for workout rest timer
 */
export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number;
  exerciseId?: string;
  exerciseName?: string;
}

/**
 * Standardized database operation result
 */
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: any;
}
