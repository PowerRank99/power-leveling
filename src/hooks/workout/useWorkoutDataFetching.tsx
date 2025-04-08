
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';
import { toast } from 'sonner';
import { ExerciseHistoryService } from '@/services/ExerciseHistoryService';

/**
 * A hook that provides reliable workout data fetching with proper hydration
 */
export function useWorkoutDataFetching() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetches previous workout data for this routine
   */
  const fetchPreviousWorkoutData = async (routineId: string) => {
    try {
      console.log("[useWorkoutDataFetching] Fetching previous workout data for routine:", routineId);
      
      // Get most recent completed workout for this routine
      const { data: previousWorkout } = await supabase
        .from('workouts')
        .select('id')
        .eq('routine_id', routineId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1);
      
      // No previous workout found
      if (!previousWorkout || previousWorkout.length === 0) {
        console.log("[useWorkoutDataFetching] No previous workout found for this routine");
        return {};
      }
      
      const previousWorkoutId = previousWorkout[0].id;
      console.log("[useWorkoutDataFetching] Found previous workout:", previousWorkoutId);
      
      // Get all sets from the previous workout
      const { data: previousSets, error } = await supabase
        .from('workout_sets')
        .select('exercise_id, weight, reps, set_order')
        .eq('workout_id', previousWorkoutId)
        .order('set_order');
      
      if (error) {
        console.error("[useWorkoutDataFetching] Error fetching previous sets:", error);
        return {};
      }
      
      // Group sets by exercise
      const previousWorkoutData = previousSets?.reduce((acc: Record<string, any[]>, set) => {
        if (!set.exercise_id) return acc;
        if (!acc[set.exercise_id]) acc[set.exercise_id] = [];
        
        acc[set.exercise_id].push({
          weight: set.weight?.toString() || '0',
          reps: set.reps?.toString() || '0',
          set_order: set.set_order
        });
        
        return acc;
      }, {}) || {};
      
      // Sort sets by set_order
      Object.keys(previousWorkoutData).forEach(exerciseId => {
        previousWorkoutData[exerciseId].sort((a: any, b: any) => a.set_order - b.set_order);
      });
      
      console.log("[useWorkoutDataFetching] Loaded previous data for", Object.keys(previousWorkoutData).length, "exercises");
      return previousWorkoutData;
    } catch (error) {
      console.error("[useWorkoutDataFetching] Error fetching previous workout data:", error);
      return {};
    }
  };
  
  /**
   * Fetches workout data with current sets or creates default sets
   */
  const fetchWorkoutExercises = async (workoutId: string, routineExercises: any[]): Promise<WorkoutExercise[]> => {
    try {
      setIsLoading(true);
      console.log("[useWorkoutDataFetching] Fetching workout exercises for workout ID:", workoutId);
      
      // Fetch previous workout data for reference
      const { data: routineData } = await supabase
        .from('workouts')
        .select('routine_id')
        .eq('id', workoutId)
        .single();
      
      // Extract all exercise IDs for bulk fetching
      const exerciseIds = routineExercises.map(re => re.exercises.id);
      
      // Get exercise history data (persisted across routines)
      const exerciseHistoryData = await ExerciseHistoryService.getMultipleExerciseHistory(exerciseIds);
      console.log("[useWorkoutDataFetching] Loaded exercise history:", exerciseHistoryData);
      
      // Get previous workout data for initial set values
      const previousWorkoutData = routineData ? 
        await fetchPreviousWorkoutData(routineData.routine_id) : {};
      
      // Fetch all workout sets for this workout
      const { data: workoutSets, error: fetchSetsError } = await supabase
        .from('workout_sets')
        .select('id, exercise_id, set_order, weight, reps, completed')
        .eq('workout_id', workoutId)
        .order('set_order');
      
      if (fetchSetsError) {
        throw fetchSetsError;
      }
      
      console.log(`[useWorkoutDataFetching] Found ${workoutSets?.length || 0} sets for workout ${workoutId}`);
      
      // Build exercise data with sets
      const workoutExercises: WorkoutExercise[] = routineExercises.map(routineExercise => {
        const exercise = routineExercise.exercises;
        
        // Filter sets for this exercise and sort them
        const exerciseSets = workoutSets
          ?.filter(set => set.exercise_id === exercise.id)
          .sort((a, b) => a.set_order - b.set_order) || [];
        
        console.log(`[useWorkoutDataFetching] Exercise ${exercise.name} has ${exerciseSets.length} sets in database`);
        
        // Get exercise history data
        const historyData = exerciseHistoryData[exercise.id];
        
        // Get previous workout data for this exercise
        const previousExerciseData = previousWorkoutData[exercise.id] || [];
        
        // Format sets from database or create defaults
        let sets = [];
        
        if (exerciseSets.length > 0) {
          // Use existing sets from database
          sets = exerciseSets.map((set, index) => {
            // First try to get values from exercise history
            // Then fallback to previous workout data
            // Finally use defaults if nothing else is available
            
            const previousSet = previousExerciseData.find(p => p.set_order === set.set_order) || 
                              previousExerciseData[index] ||
                              { weight: '0', reps: '12' };
                              
            // Use exercise history as "previous" values if available
            const historyValues = historyData ? {
              weight: historyData.weight.toString(),
              reps: historyData.reps.toString()
            } : previousSet;
            
            return {
              id: set.id,
              weight: set.weight?.toString() || '0',
              reps: set.reps?.toString() || '0',
              completed: set.completed || false,
              set_order: set.set_order,
              previous: historyValues
            };
          });
        } else {
          // Create default sets using exercise history first, then previous workout data
          const targetSets = Math.max(
            historyData ? historyData.sets : 0,
            previousExerciseData.length > 0 ? previousExerciseData.length : 0,
            routineExercise.target_sets || 3
          );
          
          console.log(`[useWorkoutDataFetching] Creating ${targetSets} default sets for ${exercise.name}`);
          
          sets = Array.from({ length: targetSets }).map((_, index) => {
            // Prioritize exercise history for defaults
            let weight = '0';
            let reps = '12';
            
            if (historyData) {
              weight = historyData.weight.toString();
              reps = historyData.reps.toString();
              console.log(`[useWorkoutDataFetching] Using history for ${exercise.name}: weight=${weight}, reps=${reps}`);
            } else if (previousExerciseData[index]) {
              weight = previousExerciseData[index].weight;
              reps = previousExerciseData[index].reps;
            }
            
            return {
              id: `default-${exercise.id}-${index}`,
              weight: weight,
              reps: reps,
              completed: false,
              set_order: index,
              previous: {
                weight: weight,
                reps: reps
              }
            };
          });
        }
        
        return {
          id: exercise.id,
          name: exercise.name,
          sets
        };
      });
      
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
