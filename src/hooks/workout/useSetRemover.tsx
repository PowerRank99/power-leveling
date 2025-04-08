
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
      console.log(`[useSetRemover] Current set count before removal: ${currentExercise.sets.length}`);
      
      // Count sets in database before removal
      const beforeCountResult = await SetService.countSetsForExercise(
        workoutId!,
        currentExercise.id
      );
      
      if (beforeCountResult.success) {
        console.log(`[useSetRemover] Database count before removal: ${beforeCountResult.data}`);
      }
      
      // Update local state first for immediate feedback
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
        
        console.log(`[useSetRemover] Set deleted from database successfully`);
        
        // Normalize set orders to ensure they're sequential
        await SetService.normalizeSetOrders(workoutId!, currentExercise.id);
      }
      
      // Verify the new set count in database
      const afterCountResult = await SetService.countSetsForExercise(
        workoutId!,
        currentExercise.id
      );
      
      if (afterCountResult.success) {
        const newCount = afterCountResult.data!;
        console.log(`[useSetRemover] Database count after removal: ${newCount}`);
        console.log(`[useSetRemover] UI state count after removal: ${updatedExercises[exerciseIndex].sets.length}`);
        
        // Verify the counts match
        if (newCount !== updatedExercises[exerciseIndex].sets.length) {
          console.warn(`[useSetRemover] Count mismatch: DB=${newCount}, UI=${updatedExercises[exerciseIndex].sets.length}`);
          
          // If there's a mismatch, reconcile by using the database as source of truth
          if (routineId) {
            await SetService.reconcileSetCount(
              workoutId!,
              currentExercise.id,
              routineId
            );
          }
        } else {
          // Update the routine exercise set count for persistence
          if (routineId) {
            console.log(`[useSetRemover] Updating routine ${routineId} exercise ${currentExercise.id} target sets to ${newCount}`);
            
            const updateResult = await SetService.updateRoutineExerciseSetsCount(
              routineId,
              currentExercise.id,
              newCount
            );
            
            if (!updateResult.success) {
              console.error(`[useSetRemover] Failed to update target sets count: ${JSON.stringify(updateResult.error)}`);
            } else {
              // Verify the update was successful
              const routineVerificationResult = await SetService.verifyRoutineExerciseSetsCount(
                routineId,
                currentExercise.id
              );
              
              if (routineVerificationResult.success) {
                console.log(`[useSetRemover] Verification: routine_exercises.target_sets = ${routineVerificationResult.data}`);
              }
            }
          }
        }
      }
      
      return updatedExercises;
    });
  };
  
  return {
    removeSet,
    isProcessing
  };
}
