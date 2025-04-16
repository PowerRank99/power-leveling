
export interface PreviousSetData {
  weight: string;
  reps: string;
}

export interface SetData {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  previous?: PreviousSetData;
  set_order?: number; // Added to match the main workoutTypes.ts
}
