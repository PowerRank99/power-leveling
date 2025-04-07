
export type WorkoutExercise = {
  id: string;
  name: string;
  sets: Array<{
    id: string;
    weight: string;
    reps: string;
    completed: boolean;
    previous?: {
      weight: string;
      reps: string;
    }
  }>;
}
