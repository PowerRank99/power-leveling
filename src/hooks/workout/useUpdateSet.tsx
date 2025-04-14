import { useState } from 'react';
import { SetData } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * A specialized hook for updating sets in a workout
 */
export const useUpdateSet = (workoutId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Updates a set with new values
   * @param exerciseIndex The index of the exercise in the array
   * @param exerciseSets The sets of the exercise to update a set from
   * @param setIndex The index of the set to update
   * @param data The data to update the set with
   * @returns An array of updated sets or null if there was an error
   */
  const updateSet = async (
    exerciseIndex: number,
    exerciseSets: SetData[],
    setIndex: number,
    data: { weight?: string; reps?: string; completed?: boolean }
  ): Promise<SetData[] | null> => {
    if (!workoutId) {
      toast.error("Erro ao atualizar série", {
        description: "Treino não encontrado"
      });
      return null;
    }

    setIsUpdating(true);
    
    try {
      // Clone the sets
      const updatedSets = [...exerciseSets];
      
      // Get the set to update
      const setToUpdate = updatedSets[setIndex];
      if (!setToUpdate) {
        console.error(`Set not found at index ${setIndex}`);
        return null;
      }
      
      // Update the set with the new data
      updatedSets[setIndex] = {
        ...setToUpdate,
        weight: data.weight !== undefined ? data.weight : setToUpdate.weight,
        reps: data.reps !== undefined ? data.reps : setToUpdate.reps,
        completed: data.completed !== undefined ? data.completed : setToUpdate.completed
      };
      
      // If this is a temporary ID (not persisted to the database yet), just return the updated sets
      if (setToUpdate.id.startsWith('new-') || setToUpdate.id.startsWith('default-')) {
        return updatedSets;
      }
      
      // Otherwise, update the set in the database
      const { error } = await supabase
        .from('workout_sets')
        .update({
          weight: updatedSets[setIndex].weight,
          reps: updatedSets[setIndex].reps,
          completed: updatedSets[setIndex].completed,
          set_order: exerciseIndex * 100 + setIndex
        })
        .eq('id', setToUpdate.id);
        
      if (error) {
        console.error("Error updating set:", error);
        toast.error("Erro ao atualizar série", {
          description: "Não foi possível atualizar a série"
        });
        return null;
      }
      
      return updatedSets;
    } catch (error) {
      console.error("Error in updateSet:", error);
      toast.error("Erro ao atualizar série", {
        description: "Não foi possível atualizar a série"
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateSet,
    isUpdating
  };
};
