
export type WorkoutExercise = {
  id: string;
  name: string;
  sets: Array<{
    id: string;
    weight: string;
    reps: string;
    completed: boolean;
    set_order?: number; 
    previous?: {
      weight: string;
      reps: string;
    }
  }>;
  exerciseId?: string; // Added to be compatible with both interfaces
}
