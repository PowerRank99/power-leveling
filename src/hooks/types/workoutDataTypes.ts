
export interface Routine {
  id: string;
  name: string;
  exercises_count?: number;
  last_used_at?: string | null;
  created_at?: string;
}

export interface RecentWorkout {
  id: string;
  name: string;
  date: string;
  exercises_count: number;
  sets_count: number;
  prs: number;
  duration_seconds: number | null;
}
