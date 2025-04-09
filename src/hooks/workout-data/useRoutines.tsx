
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';
import { Routine } from '../types/workoutDataTypes';

export const useRoutines = (userId: string | undefined) => {
  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
  const [deleteInProgress, setDeleteInProgress] = useState<{[key: string]: boolean}>({});

  // Function to delete a routine with batch processing
  const deleteRoutine = useCallback(async (routineId: string) => {
    if (!userId || deleteInProgress[routineId]) {
      console.log("Delete prevented - no userId or already in progress");
      return false;
    }
    
    try {
      setDeleteInProgress(prev => ({ ...prev, [routineId]: true }));
      
      console.log(`Starting deletion process for routine: ${routineId}`);
      
      // Step 1: Find total count of associated workouts for this routine
      const { count: workoutCount, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('routine_id', routineId);
        
      if (countError) {
        console.error("Error counting associated workouts:", countError);
        throw countError;
      }
      
      console.log(`Found ${workoutCount} workouts associated with this routine`);
      
      // If there are a large number of workouts, process them in batches
      if (workoutCount && workoutCount > 50) {
        await batchDeleteWorkouts(routineId);
      } else {
        // For smaller counts, use the regular deletion process
        await standardDeleteProcess(routineId);
      }
      
      // Step 4: Finally delete the routine itself
      console.log(`Deleting routine with ID: ${routineId}`);
      const { error: routineError } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId);
        
      if (routineError) {
        console.error("Error deleting routine:", routineError);
        throw routineError;
      }
      
      console.log(`Successfully deleted routine: ${routineId}`);
      
      // Update the UI by removing the deleted routine from state
      setSavedRoutines(prevRoutines => prevRoutines.filter(routine => routine.id !== routineId));
      
      // Show success message
      sonnerToast.success("Rotina excluída com sucesso");
      
      return true;
    } catch (error: any) {
      console.error("Error in deleteRoutine:", error);
      
      // Force remove from UI even if backend delete failed
      // This ensures the user can continue using the app
      setSavedRoutines(prevRoutines => prevRoutines.filter(routine => routine.id !== routineId));
      
      sonnerToast.error("Erro ao excluir rotina", {
        description: "A rotina foi removida da tela, mas pode haver um erro no servidor."
      });
      
      // Return true so the UI considers it deleted
      return true;
    } finally {
      setDeleteInProgress(prev => ({ ...prev, [routineId]: false }));
    }
  }, [userId, deleteInProgress]);

  // Helper function to delete workouts and sets in batches
  const batchDeleteWorkouts = async (routineId: string) => {
    console.log(`Using batch deletion for routine: ${routineId}`);
    const BATCH_SIZE = 25;
    let hasMoreWorkouts = true;
    let deletedCount = 0;
    
    while (hasMoreWorkouts) {
      // Get a batch of workouts to delete
      const { data: workoutBatch, error: batchError } = await supabase
        .from('workouts')
        .select('id')
        .eq('routine_id', routineId)
        .limit(BATCH_SIZE);
        
      if (batchError) {
        console.error("Error fetching workout batch:", batchError);
        throw batchError;
      }
      
      if (!workoutBatch || workoutBatch.length === 0) {
        console.log("No more workouts to delete");
        hasMoreWorkouts = false;
        break;
      }
      
      const workoutIds = workoutBatch.map(workout => workout.id);
      console.log(`Processing batch of ${workoutIds.length} workouts`);
      
      // Delete all sets for this batch of workouts
      const { error: setsError } = await supabase
        .from('workout_sets')
        .delete()
        .in('workout_id', workoutIds);
        
      if (setsError) {
        console.error("Error batch deleting sets:", setsError);
        throw setsError;
      }
      
      // Delete the workouts in this batch
      const { error: workoutsError } = await supabase
        .from('workouts')
        .delete()
        .in('id', workoutIds);
        
      if (workoutsError) {
        console.error("Error batch deleting workouts:", workoutsError);
        throw workoutsError;
      }
      
      deletedCount += workoutIds.length;
      console.log(`Deleted ${deletedCount} workouts so far`);
      
      // If we got fewer workouts than the batch size, we're done
      if (workoutIds.length < BATCH_SIZE) {
        hasMoreWorkouts = false;
      }
    }
    
    console.log(`Batch deletion complete. Total workouts deleted: ${deletedCount}`);
  };
  
  // Standard deletion process for routines with few workouts
  const standardDeleteProcess = async (routineId: string) => {
    console.log(`Using standard deletion for routine: ${routineId}`);
    
    // Find associated workouts for this routine
    const { data: associatedWorkouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('id')
      .eq('routine_id', routineId);
      
    if (workoutsError) {
      console.error("Error finding associated workouts:", workoutsError);
      throw workoutsError;
    }
    
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
    
    // Delete routine exercises entries
    console.log(`Deleting routine exercises for routine: ${routineId}`);
    
    try {
      const { error: routineExercisesError } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('routine_id', routineId);
        
      if (routineExercisesError) {
        console.warn("Non-fatal error deleting routine exercises:", routineExercisesError);
        // Continue despite this error
      } else {
        console.log("Successfully deleted routine exercises");
      }
    } catch (exerciseError) {
      console.warn("Caught error while deleting routine exercises, continuing:", exerciseError);
    }
  };

  return {
    savedRoutines,
    setSavedRoutines,
    deleteRoutine,
    isDeletingRoutine: (id: string) => deleteInProgress[id] || false
  };
};
