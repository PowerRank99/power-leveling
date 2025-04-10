
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
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: Array<SetData>;
}

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number;
  exerciseId?: string;
  exerciseName?: string;
}
