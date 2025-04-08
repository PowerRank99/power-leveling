
export interface SetData {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  previous?: {
    weight: string;
    reps: string;
  };
}
