import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';
import { RecentWorkout } from '../../types/workoutDataTypes';

export const useWorkoutDeletion = (
  userId: string | undefined,
  setRecentWorkouts: React.Dispatch<React.SetStateAction<RecentWorkout[]>>,
  setDeletedIds: React.Dispatch<React.SetStateAction<string[]>>
) => {
  const [deleteInProgress, setDeleteInProgress] = useState<{[key: string]: boolean}>({});
  
  const deleteWorkout = useCallback(async (workoutId: string) => {
    if (!userId || deleteInProgress[workoutId]) {
      return false;
    }
    
    try {
      setDeleteInProgress(prev => ({ ...prev, [workoutId]: true }));
      
      console.log("Deleting workout:", workoutId);
      
      // First delete all workout_sets entries for this workout
      const { error: workoutSetsError } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_id', workoutId);
        
      if (workoutSetsError) {
        console.error("Error deleting workout sets:", workoutSetsError);
        throw workoutSetsError;
      }
      
      // Then delete the workout itself
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (workoutError) {
        console.error("Error deleting workout:", workoutError);
        throw workoutError;
      }
      
      // Update the UI by removing the deleted workout from state
      setRecentWorkouts(prevWorkouts => prevWorkouts.filter(workout => workout.id !== workoutId));
      
      // Keep track of deleted workout IDs to filter them out on refetch
      setDeletedIds(prev => [...prev, workoutId]);
      
      // Show success message
      sonnerToast.success("Treino excluído com sucesso");
      
      return true;
    } catch (error: any) {
      console.error("Error in deleteWorkout:", error);
      sonnerToast.error("Erro ao excluir treino", {
        description: error.message || "Não foi possível excluir o treino. Tente novamente."
      });
      return false;
    } finally {
      setDeleteInProgress(prev => ({ ...prev, [workoutId]: false }));
    }
  }, [userId, deleteInProgress, setRecentWorkouts, setDeletedIds]);

  const isDeletingWorkout = useCallback((id: string) => {
    return deleteInProgress[id] || false;
  }, [deleteInProgress]);

  return {
    deleteWorkout,
    isDeletingWorkout
  };
};
