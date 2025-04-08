
import { WorkoutExercise, SetData } from '@/types/workoutTypes';
import { SetService } from '@/services/SetService';
import { useSetOperations } from './useSetOperations';

/**
 * Hook for updating workout sets
 */
export function useSetUpdater(workoutId: string | null) {
  const { executeOperation, isProcessing } = useSetOperations(workoutId);
  
  /**
   * Updates a set with new data
   */
  const updateSet = async (
    exerciseIndex: number,
    exercises: WorkoutExercise[],
    setIndex: number,
    data: { weight?: string; reps?: string; completed?: boolean }
  ) => {
    return executeOperation('atualizar série', async () => {
      const currentExercise = exercises[exerciseIndex];
      
      if (!currentExercise) {
        throw new Error(`Exercise not found at index ${exerciseIndex}`);
      }
      
      const currentSet = currentExercise.sets[setIndex];
      
      if (!currentSet) {
        throw new Error(`Set not found at index ${setIndex} for exercise ${currentExercise.name}`);
      }
      
      console.log(`[useSetUpdater] Updating set for ${currentExercise.name}, set #${setIndex + 1}`, data);
      
      // If this is a temporary ID, create a new set in the database first
      if (currentSet.id.startsWith('default-') || currentSet.id.startsWith('new-')) {
        console.log(`[useSetUpdater] Creating new database record for temp set ID: ${currentSet.id}`);
        
        // Parse values for database
        const weightValue = parseFloat(data.weight ?? currentSet.weight) || 0;
        const repsValue = parseInt(data.reps ?? currentSet.reps) || 0;
        const completedValue = data.completed !== undefined ? data.completed : currentSet.completed;
        
        // Create the set in the database
        const createResult = await SetService.createSet(
          workoutId!,
          currentExercise.id,
          setIndex, // Use consistent set order
          weightValue,
          repsValue,
          completedValue
        );
        
        if (!createResult.success) {
          SetService.displayError('salvar série', createResult.error);
          return exercises;
        }
        
        // Update our local state with the real database ID
        const updatedExercises = [...exercises];
        const setData = createResult.data!;
        
        updatedExercises[exerciseIndex].sets[setIndex] = {
          ...updatedExercises[exerciseIndex].sets[setIndex],
          id: setData.id,
          weight: data.weight ?? currentSet.weight,
          reps: data.reps ?? currentSet.reps,
          completed: data.completed ?? currentSet.completed,
          set_order: setIndex
        };
        
        return updatedExercises;
      } 
      // Regular update for existing database records
      else {
        // Prepare the data for update
        const updateData: { weight?: number; reps?: number; completed?: boolean } = {};
        
        if (data.weight !== undefined) {
          updateData.weight = parseFloat(data.weight) || 0;
        }
        
        if (data.reps !== undefined) {
          updateData.reps = parseInt(data.reps) || 0;
        }
        
        if (data.completed !== undefined) {
          updateData.completed = data.completed;
        }
        
        // Only update if we have something to change
        if (Object.keys(updateData).length > 0) {
          const updateResult = await SetService.updateSet(currentSet.id, updateData);
          
          if (!updateResult.success) {
            SetService.displayError('atualizar série', updateResult.error);
            return exercises;
          }
        }
        
        // Update local state with the new data
        const updatedExercises = [...exercises];
        
        updatedExercises[exerciseIndex].sets[setIndex] = {
          ...updatedExercises[exerciseIndex].sets[setIndex],
          ...data
        };
        
        return updatedExercises;
      }
    });
  };
  
  return {
    updateSet,
    isProcessing
  };
}
