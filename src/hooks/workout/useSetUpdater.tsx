
import { useState } from 'react';
import { SetData } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * A specialized hook for updating sets in a workout
 */
export const useSetUpdater = (workoutId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Updates a set with new values
   * @param exerciseIndex The index of the exercise in the array
   * @param exerciseSets The sets of the exercise to update
   * @param setIndex The index of the set to update
   * @param data The data to update (weight, reps, completed status)
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
      // Clone the array
      const updatedSets = [...exerciseSets];
      
      // Create a properly updated set with all fields preserved
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        weight: data.weight !== undefined ? data.weight : updatedSets[setIndex].weight,
        reps: data.reps !== undefined ? data.reps : updatedSets[setIndex].reps,
        completed: data.completed !== undefined ? data.completed : updatedSets[setIndex].completed
      };
      
      // Update in database if it's a permanent ID (not a temporary one)
      const setId = exerciseSets[setIndex].id;
      if (!setId.startsWith('new-') && !setId.startsWith('default-')) {
        const setData: Record<string, any> = {};
        if (data.weight !== undefined) setData.weight = parseFloat(data.weight) || 0;
        if (data.reps !== undefined) setData.reps = parseInt(data.reps) || 0;
        if (data.completed !== undefined) {
          setData.completed = data.completed;
          setData.completed_at = data.completed ? new Date().toISOString() : null;
        }
        
        const { error } = await supabase
          .from('workout_sets')
          .update(setData)
          .eq('id', setId);
          
        if (error) {
          console.error("Error updating set in database:", error);
          // Don't show toast on every update, as it can be annoying during rapid updates
        }
      }
      
      return updatedSets;
    } catch (error) {
      console.error("Error in updateSet:", error);
      toast.error("Erro ao atualizar série", {
        description: "Não foi possível salvar as alterações"
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
