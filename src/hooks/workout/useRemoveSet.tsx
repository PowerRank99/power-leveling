
import { useState } from 'react';
import { SetData } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * A specialized hook for removing sets from a workout
 */
export const useRemoveSet = (workoutId: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Updates the target set count for a routine exercise
   */
  const updateRoutineExerciseSetCount = async (exerciseId: string, routineId: string, newSetCount: number) => {
    try {
      const { error } = await supabase
        .from('routine_exercises')
        .update({ target_sets: newSetCount })
        .eq('routine_id', routineId)
        .eq('exercise_id', exerciseId);
      
      if (error) {
        console.error("Error updating routine exercise set count:", error);
      } else {
        console.log(`Successfully updated routine ${routineId}, exercise ${exerciseId} to ${newSetCount} sets`);
      }
    } catch (error) {
      console.error("Error updating routine exercise set count:", error);
    }
  };

  /**
   * Removes a set from an exercise
   * @param exerciseIndex The index of the exercise in the array
   * @param exerciseSets The sets of the exercise to remove a set from
   * @param setIndex The index of the set to remove
   * @param routineId The routine ID for updating target sets
   * @returns An array of updated sets or null if there was an error
   */
  const removeSet = async (
    exerciseIndex: number,
    exerciseSets: SetData[],
    setIndex: number,
    routineId: string
  ): Promise<SetData[] | null> => {
    if (!workoutId) {
      toast.error("Erro ao remover série", {
        description: "Treino não encontrado"
      });
      return null;
    }

    setIsProcessing(true);
    
    try {
      // Clone the sets
      const updatedSets = [...exerciseSets];
      
      // Get the set to remove
      const setToRemove = updatedSets[setIndex];
      if (!setToRemove) {
        console.error(`Set not found at index ${setIndex}`);
        return null;
      }
      
      if (updatedSets.length <= 1) {
        toast.error("Não é possível remover", {
          description: "Deve haver pelo menos uma série"
        });
        return exerciseSets;
      }
      
      // Remove the set from our local array
      updatedSets.splice(setIndex, 1);
      
      // If this is a temporary ID (not persisted to the database yet), just return the updated sets
      if (setToRemove.id.startsWith('new-') || setToRemove.id.startsWith('default-')) {
        return updatedSets;
      }
      
      // Otherwise, remove the set from the database
      const { error } = await supabase
        .from('workout_sets')
        .delete()
        .eq('id', setToRemove.id);
        
      if (error) {
        console.error("Error removing set:", error);
        toast.error("Erro ao remover série", {
          description: "Não foi possível remover a série"
        });
        return null;
      }
      
      // Reorder the remaining sets to keep the set_order sequential
      await reorderRemainingDatabaseSets(setToRemove.exercise_id, workoutId, exerciseIndex, updatedSets);
      
      // Update the routine's target set count
      await updateRoutineExerciseSetCount(setToRemove.exercise_id, routineId, updatedSets.length);
      
      return updatedSets;
    } catch (error) {
      console.error("Error in removeSet:", error);
      toast.error("Erro ao remover série", {
        description: "Não foi possível remover a série"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Reorders the remaining sets after a set has been removed
   */
  const reorderRemainingDatabaseSets = async (
    exerciseId: string,
    workoutId: string,
    exerciseIndex: number,
    remainingSets: SetData[]
  ) => {
    try {
      // Only update sets that are in the database (not temporary)
      const databaseSets = remainingSets.filter(set => 
        !set.id.startsWith('new-') && !set.id.startsWith('default-')
      );
      
      console.log(`Reordering ${databaseSets.length} database sets after removal`);
      
      // Update each set with its new order
      for (let i = 0; i < databaseSets.length; i++) {
        const set = databaseSets[i];
        const newSetOrder = exerciseIndex * 100 + i;
        
        const { error } = await supabase
          .from('workout_sets')
          .update({ set_order: newSetOrder })
          .eq('id', set.id);
          
        if (error) {
          console.error(`Error updating set ${set.id} order:`, error);
        } else {
          console.log(`Updated set ${set.id} order to ${newSetOrder}`);
        }
      }
    } catch (error) {
      console.error("Error reordering sets:", error);
    }
  };

  return {
    removeSet,
    isProcessing
  };
};

// Add an alias for backward compatibility
export const useSetRemover = useRemoveSet;
