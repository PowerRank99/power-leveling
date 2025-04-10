
export interface RoutineWithExercises {
  id: string;
  name: string;
  exercise_count: number;
  last_used_at: string | null;
  created_at: string;
  exercises: Array<{
    id: string;
    name: string;
  }>;
}
