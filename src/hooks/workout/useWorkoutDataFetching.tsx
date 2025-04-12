
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workout';
import { toast } from 'sonner';
import { PreviousWorkoutService } from '@/services/workout/PreviousWorkoutService';
import { WorkoutDataFormatter } from '@/services/workout/WorkoutDataFormatter';
import { WorkoutSetDataService } from '@/services/workout/WorkoutSetDataService';
import { SetReconciliationService } from '@/services/workout/SetReconciliationService';

/**
 * A hook that provides reliable workout data fetching with proper hydration
 */
export function useWorkoutDataFetching() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetches workout data with current sets or creates default sets
   */
  const fetchWorkoutExercises = async (workoutId: string, routineExercises: any[]): Promise<WorkoutExercise[]> => {
    try {
      setIsLoading(true);
      console.log("[useWorkoutDataFetching] Fetching workout exercises for workout ID:", workoutId);
      
      // Fetch routine ID for this workout
      const routineId = await WorkoutSetDataService.fetchWorkoutRoutineId(workoutId);
      
      // Get previous workout data for initial set values
      const previousWorkoutData = routineId ? 
        await PreviousWorkoutService.fetchPreviousWorkoutData(routineId, workoutId) : {};
      
      // Fetch all workout sets for this workout
      const workoutSets = await WorkoutSetDataService.fetchWorkoutSets(workoutId);
      
      // Build exercise data with sets - now properly awaiting the Promise
      const workoutExercises = await WorkoutDataFormatter.formatWorkoutExercises(
        routineExercises,
        workoutSets,
        previousWorkoutData
      );

      // Reconcile any discrepancies in set counts between DB and routine_exercises
      if (routineId) {
        await SetReconciliationService.reconcileSetCounts(routineId, workoutExercises, routineExercises);
      }
      
      return workoutExercises;
    } catch (error) {
      console.error("[useWorkoutDataFetching] Error fetching workout data:", error);
      toast.error("Erro ao carregar treino", {
        description: "Não foi possível carregar os dados do treino"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    fetchWorkoutExercises,
    isLoading
  };
}
