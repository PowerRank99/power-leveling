
import { WorkoutExercise } from '@/types/workoutTypes';
import { SetService } from '@/services/SetService';
import { useSetOperations } from './useSetOperations';
import { toast } from 'sonner';

/**
 * Hook for removing sets from exercises
 */
export function useSetRemover(workoutId: string | null) {
  const { executeOperation, isProcessing } = useSetOperations(workoutId);
  
  /**
   * Removes a set from an exercise
   */
  const removeSet = async (
    exerciseIndex: number,
    exercises: WorkoutExercise[],
    setIndex: number,
    routineId: string
  ) => {
    return executeOperation('remover série', async () => {
      const currentExercise = exercises[exerciseIndex];
      
      if (currentExercise.sets.length <= 1) {
        toast.error("Não é possível remover", {
          description: "Deve haver pelo menos uma série"
        });
        return exercises;
      }
      
      const setId = currentExercise.sets[setIndex].id;
      console.log(`[useSetRemover] Removing set ${setIndex + 1} for exercise ${currentExercise.name}, ID: ${setId}`);
      
      // Update local state first
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets = [
        ...currentExercise.sets.slice(0, setIndex),
        ...currentExercise.sets.slice(setIndex + 1)
      ];
      
      // Delete from database if it's a real record
      if (!setId.startsWith('default-') && !setId.startsWith('new-')) {
        const deleteResult = await SetService.deleteSet(setId);
        
        if (!deleteResult.success) {
          SetService.displayError('remover série', deleteResult.error);
          return exercises;
        }
        
        // Reorder the remaining sets in the database to maintain consistency
        await SetService.reorderSets(
          workoutId!, 
          currentExercise.id, 
          updatedExercises[exerciseIndex].sets
        );
      }
      
      // CRITICAL FIX: Always update the routine exercise set count for consistency
      // This ensures the target_sets value reflects the actual number of sets
      if (routineId) {
        const newSetCount = currentExercise.sets.length - 1;
        console.log(`[useSetRemover] Updating routine ${routineId} exercise ${currentExercise.id} target sets to ${newSetCount}`);
        
        // Make sure we never go below 1 set
        const safeSetCount = Math.max(1, newSetCount);
        await SetService.updateRoutineExerciseSetsCount(
          routineId,
          currentExercise.id,
          safeSetCount
        );
        
        // Note: We don't update exercise history here anymore
        // History will be comprehensively updated when the workout is completed
        console.log(`[useSetRemover] Set removed but deferring history update until workout completion`);
      } else {
        console.warn("[useSetRemover] No routineId provided, cannot update target_sets in routine_exercises");
      }
      
      return updatedExercises;
    });
  };
  
  return {
    removeSet,
    isProcessing
  };
}
