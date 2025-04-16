
import { useState } from 'react';
import { ExerciseHistoryService } from '@/services/ExerciseHistoryService';

/**
 * Hook for managing and accessing exercise history
 */
export function useExerciseHistory() {
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Fetch exercise history for multiple exercises
   */
  const fetchExercisesHistory = async (exerciseIds: string[]) => {
    setIsLoading(true);
    try {
      return await ExerciseHistoryService.getMultipleExerciseHistory(exerciseIds);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Update exercise history based on completed workout set
   */
  const updateExerciseHistory = async (
    exerciseId: string,
    weight: number,
    reps: number,
    sets: number
  ) => {
    return await ExerciseHistoryService.updateExerciseHistory(
      exerciseId,
      weight,
      reps,
      sets
    );
  };
  
  return {
    isLoading,
    fetchExercisesHistory,
    updateExerciseHistory
  };
}
