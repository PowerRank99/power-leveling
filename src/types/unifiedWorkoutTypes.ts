
export interface BaseWorkout {
  id: string;
  date: string;
  workoutDate: string; // ISO string for sorting
  type: 'tracked' | 'manual';
}

export interface TrackedWorkout extends BaseWorkout {
  type: 'tracked';
  name: string;
  exercisesCount: number;
  setsCount: number;
  prs: number;
  durationSeconds: number | null;
}

export interface ManualWorkout extends BaseWorkout {
  type: 'manual';
  description: string | null;
  activityType: string | null;
  photoUrl: string;
  xpAwarded: number;
  isPowerDay: boolean;
}

export type UnifiedWorkout = TrackedWorkout | ManualWorkout;
