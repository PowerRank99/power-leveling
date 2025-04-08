
import { useState } from 'react';
import { RecentWorkout } from '../types/workoutDataTypes';
import { useWorkoutDeletion } from './useWorkoutDeletion';

export const useWorkouts = (userId: string | undefined) => {
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [deletedWorkoutIds, setDeletedWorkoutIds] = useState<string[]>([]);
  const [hasMoreWorkouts, setHasMoreWorkouts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const { deleteWorkout, isDeletingWorkout } = useWorkoutDeletion(
    userId,
    setRecentWorkouts,
    setDeletedWorkoutIds
  );

  const loadMoreWorkouts = async (loadMoreFn: () => Promise<boolean>) => {
    if (isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      const hasMore = await loadMoreFn();
      setHasMoreWorkouts(hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    recentWorkouts,
    setRecentWorkouts,
    deleteWorkout,
    isDeletingWorkout,
    deletedWorkoutIds,
    hasMoreWorkouts,
    isLoadingMore,
    loadMoreWorkouts,
    setHasMoreWorkouts
  };
};
