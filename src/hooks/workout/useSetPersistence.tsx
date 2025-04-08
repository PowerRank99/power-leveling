
import { useState } from 'react';
import { WorkoutExercise } from '@/types/workoutTypes';
import { useSetUpdater } from './useSetUpdater';
import { useSetAdder } from './useSetAdder';
import { useSetRemover } from './useSetRemover';

/**
 * A hook that provides reliable set persistence operations by composing specialized hooks
 */
export function useSetPersistence(workoutId: string | null) {
  // Use individual specialized hooks
  const { updateSet, isProcessing: isUpdateProcessing } = useSetUpdater(workoutId);
  const { addSet, isProcessing: isAddProcessing } = useSetAdder(workoutId);
  const { removeSet, isProcessing: isRemoveProcessing } = useSetRemover(workoutId);
  
  // Combine processing states
  const isProcessing = isUpdateProcessing || isAddProcessing || isRemoveProcessing;
  
  return {
    updateSet,
    addSet,
    removeSet,
    isProcessing
  };
}
