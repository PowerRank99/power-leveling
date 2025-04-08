
import { useState } from 'react';
import { WorkoutExercise } from '@/types/workout';
import { useWorkoutSetUpdate } from './useWorkoutSetUpdate';
import { useWorkoutSetAdd } from './useWorkoutSetAdd';
import { useWorkoutSetRemove } from './useWorkoutSetRemove';

export const useWorkoutSetsManagement = (
  workoutId: string | null, 
  exercises: WorkoutExercise[], 
  currentExerciseIndex: number
) => {
  const { updateSet: updateSetAction } = useWorkoutSetUpdate(workoutId, exercises, currentExerciseIndex);
  const { addSet: addSetAction } = useWorkoutSetAdd(workoutId, exercises, currentExerciseIndex);
  const { removeSet: removeSetAction } = useWorkoutSetRemove(workoutId);
  
  const updateSet = async (exerciseIndex: number, setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    const result = await updateSetAction(setIndex, data);
    return result;
  };
  
  const addSet = async () => {
    const result = await addSetAction();
    return result;
  };
  
  const removeSet = async (exerciseIndex: number, setIndex: number) => {
    const result = await removeSetAction(exerciseIndex, exercises, setIndex);
    return result;
  };
  
  return {
    updateSet,
    addSet,
    removeSet
  };
};
