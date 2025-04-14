
export interface ManualWorkout {
  id: string;
  description?: string | null;
  activityType?: string | null;
  exerciseId?: string | null;
  photoUrl: string;
  xpAwarded: number;
  createdAt: string;
  workoutDate: string;
  isPowerDay: boolean;
}

export interface ManualWorkoutData {
  description?: string;
  activityType?: string;
  exerciseId?: string | null;
  photoUrl: string;
  workoutDate: Date | string;
  usePowerDay?: boolean;
}

export interface ManualWorkoutSubmissionResult {
  success: boolean;
  error?: string;
  isPowerDay?: boolean;
}
