
import { Routine, RecentWorkout } from '../types/workoutDataTypes';
import { useWorkoutDataCoordinator } from './fetch/useWorkoutDataCoordinator';

export const useWorkoutDataFetch = (
  userId: string | undefined,
  setRoutines: (routines: Routine[]) => void,
  setWorkouts: (workouts: RecentWorkout[]) => void,
  deletedWorkoutIds: string[],
  pathname: string,
  lastRefresh: number
) => {
  return useWorkoutDataCoordinator(
    userId,
    setRoutines,
    setWorkouts,
    deletedWorkoutIds,
    pathname,
    lastRefresh
  );
};
