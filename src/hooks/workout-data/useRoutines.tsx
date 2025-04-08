
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
      
      // Step 1: Find associated workouts for this routine
      const { data: associatedWorkouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('id')
        .eq('routine_id', routineId);
        
      if (workoutsError) {
        console.error("Error finding associated workouts:", workoutsError);
        throw workoutsError;
      }
      
      // Step 2: For each associated workout, delete workout_sets first
      if (associatedWorkouts && associatedWorkouts.length > 0) {
        console.log(`Found ${associatedWorkouts.length} workouts associated with this routine`);
        
        const workoutIds = associatedWorkouts.map(workout => workout.id);
        
        // Delete all workout sets for these workouts
        const { error: setsError } = await supabase
          .from('workout_sets')
          .delete()
          .in('workout_id', workoutIds);
          
        if (setsError) {
          console.error("Error deleting associated workout sets:", setsError);
          throw setsError;
        }
        
        console.log(`Deleted workout sets for ${workoutIds.length} workouts`);
        
        // Now delete the workouts themselves
        const { error: deleteWorkoutsError } = await supabase
          .from('workouts')
          .delete()
          .in('id', workoutIds);
          
        if (deleteWorkoutsError) {
          console.error("Error deleting associated workouts:", deleteWorkoutsError);
          throw deleteWorkoutsError;
        }
        
        console.log(`Successfully deleted ${workoutIds.length} associated workouts`);
      } else {
        console.log("No associated workouts found for this routine");
      }
      
      // Step 3: Delete all routine_exercises entries for this routine
      const { error: routineExercisesError } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('routine_id', routineId);
        
      if (routineExercisesError) {
        console.error("Error deleting routine exercises:", routineExercisesError);
        throw routineExercisesError;
      }
      
      // Step 4: Finally delete the routine itself
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
