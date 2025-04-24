
export interface TrackedWorkout {
  id: string;
  type: 'tracked';
  name: string;
  date: string;
  workoutDate: string;
  exercisesCount: number;
  setsCount: number;
  prs?: number;
  durationSeconds?: number | null;
  xpAwarded?: number; // Add XP awarded field
}

export interface ManualWorkout {
  id: string;
  type: 'manual';
  date: string;
  workoutDate: string;
  description?: string;
  activityType?: string;
  photoUrl?: string;
  xpAwarded: number;
  isPowerDay: boolean;
}

export type UnifiedWorkout = TrackedWorkout | ManualWorkout;
