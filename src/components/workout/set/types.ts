
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
  // Set order is needed for database persistence
  set_order?: number;
}
