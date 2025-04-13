
import { useState } from 'react';
import { WorkoutExercise } from '@/types/workoutTypes';
import { useWorkoutSetOperations } from './useWorkoutSetOperations';

/**
 * Main hook for workout set management that leverages the composition pattern
 */
export const useWorkoutSetManagement = (
  workoutId: string | null, 
  exercises: WorkoutExercise[],
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExercise[]>>,
  routineId: string
) => {
  // Use the specialized operations hook
  const {
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleCompleteSet,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    isProcessing
  } = useWorkoutSetOperations(workoutId, exercises, setExercises, routineId);

  return {
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleCompleteSet,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    isProcessing
  };
};
