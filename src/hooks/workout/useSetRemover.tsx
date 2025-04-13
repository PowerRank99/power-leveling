
import { useState } from 'react';
import { SetData } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * A specialized hook for removing sets from a workout
 */
export const useSetRemover = (workoutId: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);

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

    if (exerciseSets.length <= 1) {
      toast.error("Não é possível remover", {
        description: "Deve haver pelo menos uma série"
      });
      return exerciseSets;
    }

    setIsProcessing(true);
    
    try {
      // Clone the sets and remove the set at the specified index
      const updatedSets = [
        ...exerciseSets.slice(0, setIndex),
        ...exerciseSets.slice(setIndex + 1)
      ];
      
      // Remove from database if it's a permanent ID (not a temporary one)
      const setId = exerciseSets[setIndex].id;
      if (!setId.startsWith('new-') && !setId.startsWith('default-')) {
        const { error } = await supabase
          .from('workout_sets')
          .delete()
          .eq('id', setId);
          
        if (error) {
          console.error("Error deleting set from database:", error);
          toast.error("Erro ao remover série do banco de dados", {
            description: "A série pode não ter sido removida corretamente"
          });
        }
      }
      
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

  return {
    removeSet,
    isProcessing
  };
};
