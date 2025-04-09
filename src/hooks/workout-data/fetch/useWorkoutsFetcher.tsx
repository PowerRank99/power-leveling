
import { useState, useEffect } from 'react';
import { RecentWorkout } from '../../types/workoutDataTypes';
import { useFetchWorkoutsPagination } from '../pagination/useFetchWorkoutsPagination';
import { useWorkoutProcessor } from '../processors/useWorkoutProcessor';

export const useWorkoutsFetcher = (
  userId: string | undefined,
  setWorkouts: (workouts: RecentWorkout[] | ((prev: RecentWorkout[]) => RecentWorkout[])) => void,
  deletedWorkoutIds: string[],
  lastRefresh: number
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  // Use the extracted pagination hooks
  const {
    fetchWorkouts,
    hasMoreWorkouts,
    setHasMoreWorkouts,
    currentPage,
    setCurrentPage
  } = useFetchWorkoutsPagination(userId, deletedWorkoutIds);
  
  // Use the extracted processor hook
  const { processWorkouts } = useWorkoutProcessor();

  // Main useEffect for initial page load
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialWorkouts = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        setCurrentPage(1); // Reset to page 1 when user ID or refresh changes
        
        const { data: workoutsData, hasMore } = await fetchWorkouts(1);
        const processedWorkouts = await processWorkouts(workoutsData);
        
        if (isMounted) {
          setWorkouts(processedWorkouts);
          setHasMoreWorkouts(hasMore);
          setError(null);
        }
      } catch (error: any) {
        console.error('Error loading initial workout data:', error);
        if (isMounted) {
          setError(error.message || "Não foi possível carregar seus treinos");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setHasAttemptedLoad(true);
        }
      }
    };
    
    loadInitialWorkouts();
    
    return () => {
      isMounted = false;
    };
  }, [userId, setWorkouts, lastRefresh, fetchWorkouts, processWorkouts, setCurrentPage, setHasMoreWorkouts]);
  
  // Function to load more workouts (next page)
  const loadMoreWorkouts = async () => {
    if (!userId || !hasMoreWorkouts) return false;
    
    try {
      setIsLoading(true);
      const nextPage = currentPage + 1;
      
      const { data: workoutsData, hasMore } = await fetchWorkouts(nextPage);
      const processedWorkouts = await processWorkouts(workoutsData);
      
      setWorkouts((prev: RecentWorkout[]) => [...prev, ...processedWorkouts]);
      setCurrentPage(nextPage);
      setHasMoreWorkouts(hasMore);
      return true;
    } catch (error: any) {
      console.error('Error loading more workouts:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    hasAttemptedLoad,
    hasMoreWorkouts,
    loadMoreWorkouts
  };
};
