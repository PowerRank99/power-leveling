
import { useState } from 'react';
import { SetData } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * A specialized hook for adding sets to a workout
 */
export const useSetAdder = (workoutId: string | null) => {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Adds a new set to an exercise
   * @param exerciseIndex The index of the exercise in the array
   * @param exerciseSets The sets of the exercise to add a set to
   * @param routineId The routine ID for updating target sets
   * @returns An array of updated sets or null if there was an error
   */
  const addSet = async (
    exerciseIndex: number,
    exerciseSets: SetData[],
    routineId: string
  ): Promise<SetData[] | null> => {
    if (!workoutId) {
      toast.error("Erro ao adicionar série", {
        description: "Treino não encontrado"
      });
      return null;
    }

    setIsProcessing(true);
    
    try {
      // Clone the sets
      const updatedSets = [...exerciseSets];
      
      // Get the last set as a template
      const lastSet = updatedSets.length > 0
        ? updatedSets[updatedSets.length - 1]
        : { weight: '0', reps: '12', completed: false, previous: { weight: '0', reps: '12' } };
        
      // Get exercise_id from the existing sets or use a default
      const exerciseId = lastSet.exercise_id || 
        (exerciseSets.length > 0 ? exerciseSets[0].exercise_id : '');
        
      // Create new set with a temporary ID
      const newSetId = `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newSet: SetData = {
        id: newSetId,
        exercise_id: exerciseId,
        weight: lastSet.weight,
        reps: lastSet.reps,
        completed: false,
        set_order: updatedSets.length,
        previous: lastSet.previous || { weight: '0', reps: '12' }
      };
      
      // Add to our local array
      updatedSets.push(newSet);
      
      return updatedSets;
    } catch (error) {
      console.error("Error in addSet:", error);
      toast.error("Erro ao adicionar série", {
        description: "Não foi possível adicionar a série"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    addSet,
    isProcessing
  };
};
