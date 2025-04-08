
import { useState, useCallback } from 'react';
import { WorkoutExercise } from '@/types/workout';
import { useUpdateSet } from './useUpdateSet';
import { useAddSet } from './useAddSet';
import { useRemoveSet } from './useRemoveSet';

export const useWorkoutSetsManagement = (
  workoutId: string | null, 
  initialExercises: WorkoutExercise[], 
  currentExerciseIndex: number
) => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialExercises);
  const { updateSet: updateSetHook } = useUpdateSet(workoutId);
  const { addSet: addSetHook } = useAddSet(workoutId);
  const { removeSet: removeSetHook } = useRemoveSet(workoutId);
  
  // Update exercises state whenever props change
  if (JSON.stringify(exercises) !== JSON.stringify(initialExercises)) {
    setExercises(initialExercises);
  }
  
  const updateSet = useCallback(async (setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    console.log(`Updating set ${setIndex} for exercise ${currentExerciseIndex}`, data);
    
    const updatedExercises = await updateSetHook(currentExerciseIndex, exercises, setIndex, data);
    
    if (updatedExercises) {
      setExercises(updatedExercises);
      return true;
    }
    return false;
  }, [workoutId, exercises, currentExerciseIndex, updateSetHook]);
  
  const addSet = useCallback(async (routineId: string) => {
    console.log(`Adding set for exercise ${currentExerciseIndex}`);
    
    const updatedExercises = await addSetHook(currentExerciseIndex, exercises, routineId);
    
    if (updatedExercises) {
      setExercises(updatedExercises);
      return true;
    }
    return false;
  }, [workoutId, exercises, currentExerciseIndex, addSetHook]);
  
  const removeSet = useCallback(async (setIndex: number, routineId: string) => {
    console.log(`Removing set ${setIndex} from exercise ${currentExerciseIndex}`);
    
    const updatedExercises = await removeSetHook(currentExerciseIndex, exercises, setIndex, routineId);
    
    if (updatedExercises) {
      setExercises(updatedExercises);
      return true;
    }
    return false;
  }, [workoutId, exercises, currentExerciseIndex, removeSetHook]);
  
  return {
    exercises: exercises[currentExerciseIndex],
    updateSet,
    addSet,
    removeSet,
  };
};
