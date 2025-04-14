
/**
 * Data needed to submit a manual workout
 */
export interface ManualWorkoutData {
  photoUrl: string;
  description?: string;
  exerciseId?: string;
  activityType?: string;
  workoutDate: Date;
  usePowerDay?: boolean;
}

/**
 * Manual workout record as stored in the database
 */
export interface ManualWorkout {
  id: string;
  description: string;
  activityType: string;
  exerciseId?: string | null;
  photoUrl: string;
  xpAwarded: number;
  createdAt: string;
  workoutDate: string;
  isPowerDay: boolean;
}
