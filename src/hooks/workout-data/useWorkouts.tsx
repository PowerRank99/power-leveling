
import { useState } from 'react';
import { RecentWorkout } from '../types/workoutDataTypes';
import { useWorkoutDeletion } from './useWorkoutDeletion';

export const useWorkouts = (userId: string | undefined) => {
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [deletedWorkoutIds, setDeletedWorkoutIds] = useState<string[]>([]);
  
  const { deleteWorkout, isDeletingWorkout } = useWorkoutDeletion(
    userId,
    setRecentWorkouts,
    setDeletedWorkoutIds
  );

  return {
    recentWorkouts,
    setRecentWorkouts,
    deleteWorkout,
    isDeletingWorkout,
    deletedWorkoutIds
  };
};
