
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
