
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';
import { Routine } from '../types/workoutDataTypes';

export const useRoutines = (userId: string | undefined) => {
  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
  const [deleteInProgress, setDeleteInProgress] = useState<{[key: string]: boolean}>({});

  // Function to delete a routine
  const deleteRoutine = useCallback(async (routineId: string) => {
    if (!userId || deleteInProgress[routineId]) {
      return false;
    }
    
    try {
      setDeleteInProgress(prev => ({ ...prev, [routineId]: true }));
      
      console.log("Deleting routine:", routineId);
      
      // First delete all routine_exercises entries for this routine
      const { error: routineExercisesError } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('routine_id', routineId);
        
      if (routineExercisesError) {
        console.error("Error deleting routine exercises:", routineExercisesError);
        throw routineExercisesError;
      }
      
      // Then delete the routine itself
      const { error: routineError } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId);
        
      if (routineError) {
        console.error("Error deleting routine:", routineError);
        throw routineError;
      }
      
      // Update the UI by removing the deleted routine from state
      setSavedRoutines(prevRoutines => prevRoutines.filter(routine => routine.id !== routineId));
      
      // Show success message
      sonnerToast.success("Rotina excluída com sucesso");
      
      return true;
    } catch (error: any) {
      console.error("Error in deleteRoutine:", error);
      sonnerToast.error("Erro ao excluir rotina", {
        description: error.message || "Não foi possível excluir a rotina. Tente novamente."
      });
      return false;
    } finally {
      setDeleteInProgress(prev => ({ ...prev, [routineId]: false }));
    }
  }, [userId, deleteInProgress]);

  return {
    savedRoutines,
    setSavedRoutines,
    deleteRoutine,
    isDeletingRoutine: (id: string) => deleteInProgress[id] || false
  };
};
