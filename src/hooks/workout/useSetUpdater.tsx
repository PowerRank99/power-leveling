import { useState } from 'react';
import { SetData } from '@/types/workoutTypes';

export const useSetUpdater = (workoutId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateSet = async (
    exerciseIndex: number,
    sets: SetData[],
    setIndex: number,
    data: { weight?: string; reps?: string; completed?: boolean }
  ): Promise<SetData[]> => {
    setIsUpdating(true);
    try {
      if (!workoutId) {
        console.error("Workout ID is null");
        return sets;
      }

      const setId = sets[setIndex].id;
      console.log(`Updating set ${setId} with data:`, data);

      // Optimistically update the local state
      const updatedSets = [...sets];
      updatedSets[setIndex] = { ...updatedSets[setIndex], ...data };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      return updatedSets;
    } catch (error) {
      console.error("Error updating set:", error);
      return sets;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateSet, isUpdating };
};
