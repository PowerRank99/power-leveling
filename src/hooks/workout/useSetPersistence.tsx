
import { useState } from 'react';
import { SetData } from '@/types/workout';
import { useSetAdder } from './useSetAdder';
import { useRemoveSet } from './useRemoveSet';
import { useSetUpdater } from './useSetUpdater';

/**
 * A unified hook that combines all set operations (add, remove, update)
 * using the composition pattern.
 */
export const useSetPersistence = (workoutId: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Compose specialized hooks with their core functionality
  const { addSet: adderAddSet, isProcessing: isAddProcessing } = useSetAdder(workoutId);
  const { removeSet: removerRemoveSet, isProcessing: isRemoveProcessing } = useRemoveSet(workoutId);
  const { updateSet: updaterUpdateSet, isUpdating: isUpdateProcessing } = useSetUpdater(workoutId);
  
  /**
   * Wrapper for addSet that manages processing state
   */
  const addSet = async (
    exerciseIndex: number,
    exerciseSets: SetData[],
    routineId: string
  ): Promise<SetData[] | null> => {
    setIsProcessing(true);
    try {
      return await adderAddSet(exerciseIndex, exerciseSets, routineId);
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Wrapper for removeSet that manages processing state
   */
  const removeSet = async (
    exerciseIndex: number,
    exerciseSets: SetData[],
    setIndex: number,
    routineId: string
  ): Promise<SetData[] | null> => {
    setIsProcessing(true);
    try {
      return await removerRemoveSet(exerciseIndex, exerciseSets, setIndex, routineId);
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Wrapper for updateSet that manages processing state
   */
  const updateSet = async (
    exerciseIndex: number,
    exerciseSets: SetData[],
    setIndex: number,
    data: { weight?: string; reps?: string; completed?: boolean }
  ): Promise<SetData[] | null> => {
    setIsProcessing(true);
    try {
      return await updaterUpdateSet(exerciseIndex, exerciseSets, setIndex, data);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    addSet,
    removeSet,
    updateSet,
    isProcessing: isProcessing || isAddProcessing || isRemoveProcessing || isUpdateProcessing
  };
};

// Define an alias for useSetManagement for backward compatibility
export const useSetManagement = useSetPersistence;
