
// Basic set types
export interface PreviousSetData {
  weight: string;
  reps: string;
}

export interface SetData {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  set_order?: number;
  previous?: PreviousSetData;
}

export interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  set_order: number;
  previous?: {
    weight: string;
    reps: string;
  };
}

export interface WorkoutExercise {
  id: string;
  name: string;
  type?: string; // Exercise type: "Musculação", "Calistenia", etc.
  sets: WorkoutSet[];
}

export interface WorkoutData {
  id: string;
  routineId: string | null;
  exercises: WorkoutExercise[];
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  notes?: Record<string, string>;
}

// Database utility types
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: any;
}

// Exercise history type
export interface ExerciseHistory {
  id: string;
  user_id: string;
  exercise_id: string;
  weight: number;
  reps: number;
  sets: number;
  last_used_at: string;
  created_at?: string;
}
