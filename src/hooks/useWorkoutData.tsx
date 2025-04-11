import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { useRoutines } from './workout-data/routines';
import { useWorkouts } from './workout-data/workouts';
import { useWorkoutDataFetch } from './workout-data/useWorkoutDataFetch';
import { Routine, RecentWorkout } from './types/workoutDataTypes';

export type { Routine, RecentWorkout } from './types/workoutDataTypes';

export const useWorkoutData = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  
  const {
    savedRoutines,
    setSavedRoutines,
    deleteRoutine,
    isDeletingRoutine
  } = useRoutines(user?.id);
  
  const {
    recentWorkouts,
    setRecentWorkouts,
    deleteWorkout,
    isDeletingWorkout,
    deletedWorkoutIds,
    hasMoreWorkouts,
    isLoadingMore,
    loadMoreWorkouts,
    setHasMoreWorkouts
  } = useWorkouts(user?.id);
  
  const {
    isLoading,
    refreshData: refreshDataInternal,
    error,
    hasAttemptedLoad,
    loadMoreWorkouts: loadMoreWorkoutsInternal,
    hasMoreWorkouts: hasMoreWorkoutsInternal
  } = useWorkoutDataFetch(
    user?.id,
    setSavedRoutines,
    setRecentWorkouts,
    deletedWorkoutIds,
    location.pathname,
    lastRefresh
  );
  
  const refreshData = useCallback(() => {
    console.log("Force refreshing workout data");
    setLastRefresh(Date.now());
    refreshDataInternal();
  }, [refreshDataInternal]);
  
  const isDeletingItem = useCallback((id: string) => {
    return isDeletingRoutine(id) || isDeletingWorkout(id);
  }, [isDeletingRoutine, isDeletingWorkout]);

  // Function to load more workouts
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreWorkoutsInternal) return;
    await loadMoreWorkouts(() => loadMoreWorkoutsInternal());
  }, [isLoadingMore, hasMoreWorkoutsInternal, loadMoreWorkouts, loadMoreWorkoutsInternal]);

  return {
    savedRoutines,
    recentWorkouts,
    isLoading,
    refreshData,
    error,
    hasAttemptedLoad,
    deleteRoutine,
    deleteWorkout,
    isDeletingItem,
    hasMoreWorkouts: hasMoreWorkoutsInternal,
    isLoadingMore,
    loadMoreWorkouts: handleLoadMore
  };
};
