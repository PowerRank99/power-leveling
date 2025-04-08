
import { WorkoutExercise } from '@/types/workoutTypes';
import { SetService } from '@/services/SetService';
import { useSetOperations } from './useSetOperations';

/**
 * Hook for adding new sets to exercises
 */
export function useSetAdder(workoutId: string | null) {
  const { executeOperation, isProcessing } = useSetOperations(workoutId);
  
  /**
   * Adds a new set to an exercise
   */
  const addSet = async (
    exerciseIndex: number,
    exercises: WorkoutExercise[],
    routineId: string
  ) => {
    return executeOperation('adicionar série', async () => {
      const currentExercise = exercises[exerciseIndex];
      const currentSets = currentExercise.sets;
      const lastSet = currentSets.length > 0 ? currentSets[currentSets.length - 1] : null;
      
      // Calculate values for the new set
      const weightValue = lastSet ? parseFloat(lastSet.weight) || 0 : 0;
      const repsValue = lastSet ? parseInt(lastSet.reps) || 12 : 12;
      const newSetOrder = currentSets.length; // Simple incremental order
      
      console.log(`[useSetAdder] Adding new set to ${currentExercise.name} with order=${newSetOrder}, weight=${weightValue}, reps=${repsValue}`);
      
      // Create the set in the database first
      const createResult = await SetService.createSet(
        workoutId!,
        currentExercise.id,
        newSetOrder,
        weightValue,
        repsValue,
        false
      );
      
      if (!createResult.success) {
        SetService.displayError('adicionar série', createResult.error);
        return exercises;
      }
      
      const newSet = createResult.data!;
      console.log(`[useSetAdder] Successfully added set with ID ${newSet.id}`);
      
      // Update local state with the new set
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets.push({
        id: newSet.id,
        weight: newSet.weight,
        reps: newSet.reps,
        completed: newSet.completed,
        set_order: newSet.set_order,
        previous: lastSet?.previous || { weight: '0', reps: '12' }
      });
      
      // CRITICAL FIX: Always update the target_sets in routine_exercises
      // This ensures that when the workout is reopened, we display the correct number of sets
      if (routineId) {
        const newSetsCount = currentSets.length + 1;
        console.log(`[useSetAdder] Updating routine ${routineId} exercise ${currentExercise.id} target sets to ${newSetsCount}`);
        
        await SetService.updateRoutineExerciseSetsCount(
          routineId,
          currentExercise.id,
          newSetsCount
        );
        
        // Don't update exercise history immediately when adding a set
        // This prevents conflicts between completed sets and target sets
        // History will be comprehensively updated when finishing the workout
        console.log(`[useSetAdder] Set added but deferring history update until workout completion`);
      } else {
        console.warn("[useSetAdder] No routineId provided, cannot update target_sets in routine_exercises");
      }
      
      return updatedExercises;
    });
  };
  
  return {
    addSet,
    isProcessing
  };
}
