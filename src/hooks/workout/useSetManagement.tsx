
import { useSetUpdater } from './useSetUpdater';
import { useSetAdder } from './useSetAdder';
import { useSetRemover } from './useSetRemover';

/**
 * A hook that composes specialized set management hooks into a unified API
 * This is the main entry point for set management operations
 */
export const useSetManagement = (workoutId: string | null) => {
  // Use specialized hooks for different set operations
  const { updateSet, isUpdating } = useSetUpdater(workoutId);
  const { addSet, isProcessing: isAddProcessing } = useSetAdder(workoutId);
  const { removeSet, isProcessing: isRemoveProcessing } = useSetRemover(workoutId);
  
  // Combine processing states for a unified loading state
  const isProcessing = isUpdating || isAddProcessing || isRemoveProcessing;
  
  return {
    updateSet,
    addSet,
    removeSet,
    isProcessing
  };
};
