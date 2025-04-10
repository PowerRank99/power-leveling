
export type WorkoutExercise = {
  id: string;
  name: string;
  sets: Array<{
    id: string;
    weight: string;
    reps: string;
    completed: boolean;
    set_order?: number; // Added to match the SetData interface
    previous?: {
      weight: string;
      reps: string;
    }
  }>;
}
