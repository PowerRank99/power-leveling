
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

export interface ManualWorkoutSubmissionResult {
  success: boolean;
  error?: string;
  isPowerDay?: boolean;
}
