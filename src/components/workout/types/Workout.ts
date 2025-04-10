
export interface RoutineWithExercises {
  id: string;
  name: string;
  exercise_count: number;
  exercises_count?: number; // Added for compatibility with Routine type
  last_used_at: string | null;
  created_at: string;
  exercises: Array<{
    id: string;
    name: string;
  }>;
}
