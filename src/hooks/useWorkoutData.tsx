
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { useRoutines } from './workout-data/useRoutines';
import { useWorkouts } from './workout-data/useWorkouts';
import { useWorkoutDataFetch } from './workout-data/useWorkoutDataFetch';
import { Routine, RecentWorkout } from './types/workoutDataTypes';

export type { Routine, RecentWorkout } from './types/workoutDataTypes';

export const useWorkoutData = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  
  // Use our new separated hooks
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
    isDeletingWorkout
  } = useWorkouts(user?.id);
  
  const {
    isLoading,
    refreshData: refreshDataInternal,
    error,
    hasAttemptedLoad
  } = useWorkoutDataFetch(
    user?.id,
    setSavedRoutines,
    setRecentWorkouts,
    location.pathname,
    lastRefresh
  );
  
  // Function to force a refresh
  const refreshData = useCallback(() => {
    console.log("Force refreshing workout data");
    setLastRefresh(Date.now());
    refreshDataInternal();
  }, [refreshDataInternal]);
  
  // Combined function to check if an item is being deleted
  const isDeletingItem = useCallback((id: string) => {
    return isDeletingRoutine(id) || isDeletingWorkout(id);
  }, [isDeletingRoutine, isDeletingWorkout]);

  return {
    savedRoutines,
    recentWorkouts,
    isLoading,
    refreshData,
    error,
    hasAttemptedLoad,
    deleteRoutine,
    deleteWorkout,
    isDeletingItem
  };
};
