
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Routine, RecentWorkout } from '../../types/workoutDataTypes';
import { useRoutinesFetcher } from './useRoutinesFetcher';
import { useWorkoutsFetcher } from './useWorkoutsFetcher';

export const useWorkoutDataCoordinator = (
  userId: string | undefined,
  setRoutines: (routines: Routine[]) => void,
  setWorkouts: (workouts: RecentWorkout[]) => void,
  deletedWorkoutIds: string[],
  pathname: string,
  lastRefresh: number
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Use the separated hooks for fetching routines and workouts
  const {
    isLoading: isLoadingRoutines,
    error: routinesError,
    hasAttemptedLoad: hasAttemptedRoutinesLoad
  } = useRoutinesFetcher(userId, setRoutines, lastRefresh);
  
  const {
    isLoading: isLoadingWorkouts,
    error: workoutsError,
    hasAttemptedLoad: hasAttemptedWorkoutsLoad,
    hasMoreWorkouts,
    loadMoreWorkouts
  } = useWorkoutsFetcher(userId, setWorkouts, deletedWorkoutIds, lastRefresh);

  // Track overall loading state
  useEffect(() => {
    setIsLoading(isLoadingRoutines || isLoadingWorkouts);
  }, [isLoadingRoutines, isLoadingWorkouts]);

  // Track overall error state
  useEffect(() => {
    const newError = routinesError || workoutsError;
    setError(newError);
    
    if (newError) {
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar seus treinos. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  }, [routinesError, workoutsError, toast]);

  // Track overall load attempt state
  useEffect(() => {
    setHasAttemptedLoad(hasAttemptedRoutinesLoad && hasAttemptedWorkoutsLoad);
  }, [hasAttemptedRoutinesLoad, hasAttemptedWorkoutsLoad]);

  // Function to force a refresh
  const refreshData = useCallback(() => {
    console.log("Force refreshing workout data");
    // This will trigger a refetch through the dependency on lastRefresh in the parent component
    setError(null);
  }, []);

  return {
    isLoading,
    refreshData,
    error,
    hasAttemptedLoad,
    hasMoreWorkouts,
    loadMoreWorkouts
  };
};
