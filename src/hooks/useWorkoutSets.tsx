
import { useState, useEffect } from 'react';
import { WorkoutExercise } from '@/types/workout';
import { useWorkoutSetsManagement } from './workout/useWorkoutSetsManagement';

export const useWorkoutSets = (
  workoutId: string | null, 
  exercises: WorkoutExercise[], 
  currentExerciseIndex: number
) => {
  // Use the consolidated set management hook
  const { 
    exercises: currentExercise, 
    updateSet, 
    addSet, 
    removeSet 
  } = useWorkoutSetsManagement(workoutId, exercises, currentExerciseIndex);
  
  return {
    currentExercise,
    updateSet,
    addSet,
    removeSet
  };
};
