
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';
import { useWorkoutDataFetching } from '../workout/useWorkoutDataFetching';

/**
 * Hook responsible for initializing and setting up a workout
 */
export const useWorkoutSetup = (routineId: string, navigate: NavigateFunction) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  
  // Import specialized hooks
  const { fetchWorkoutExercises } = useWorkoutDataFetching();

  /**
   * Initialize or find an existing workout
   */
  const setupWorkout = async () => {
    if (!routineId) {
      setLoadError("ID da rotina não fornecido");
      setIsLoading(false);
      return;
    }

    if (isInitialized || isCreatingWorkout) {
      console.log("[useWorkoutSetup] Workout already initialized or in progress, skipping setup");
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      setIsCreatingWorkout(true);
      
      console.log("[useWorkoutSetup] Setting up workout for routine:", routineId);
      
      // Check if routine exists and user has access
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .select('id, name')
        .eq('id', routineId)
        .single();
      
      if (routineError || !routineData) {
        throw new Error("Rotina não encontrada ou acesso negado");
      }
      
      // Fetch routine exercises to validate BEFORE creating/finding workout
      const { data: routineExercises, error: exercisesError } = await supabase
        .from('routine_exercises')
        .select(`
          id,
          target_sets,
          target_reps,
          display_order,
          exercises (
            id,
            name
          )
        `)
        .eq('routine_id', routineId)
        .order('display_order');
      
      if (exercisesError || !routineExercises || routineExercises.length === 0) {
        throw new Error("Não foi possível encontrar exercícios para esta rotina");
      }
      
      // Check for existing in-progress workout
      const { data: existingWorkout, error: existingError } = await supabase
        .from('workouts')
        .select('id')
        .eq('routine_id', routineId)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1);
      
      let currentWorkoutId;
      
      // Use existing workout if found
      if (existingWorkout && existingWorkout.length > 0) {
        console.log("[useWorkoutSetup] Found existing workout:", existingWorkout[0].id);
        currentWorkoutId = existingWorkout[0].id;
      }
      // Create new workout
      else {
        console.log("[useWorkoutSetup] Creating new workout for routine:", routineId);
        const { data: newWorkout, error: createError } = await supabase
          .from('workouts')
          .insert({
            routine_id: routineId,
            started_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError || !newWorkout) {
          throw new Error("Erro ao criar novo treino");
        }
        
        currentWorkoutId = newWorkout.id;
        console.log("[useWorkoutSetup] Created new workout:", currentWorkoutId);
        
        // Update routine's last used timestamp
        await supabase
          .from('routines')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', routineId);
      }
      
      // Fetch all workout data with proper set information - now awaiting the Promise
      const workoutExercises = await fetchWorkoutExercises(currentWorkoutId, routineExercises);
      
      // Set state with fetched data
      setWorkoutId(currentWorkoutId);
      // Use type assertion to ensure type compatibility
      setExercises(workoutExercises as unknown as WorkoutExercise[]);
      setIsInitialized(true);
      
    } catch (error: any) {
      console.error("[useWorkoutSetup] Error in setupWorkout:", error);
      setLoadError(error.message || "Erro ao iniciar treino");
      
      // Use a consistent error ID to prevent duplicate toasts
      toast.error("Erro ao carregar treino", {
        description: error.message || "Não foi possível iniciar seu treino. Tente novamente.",
        id: `workout-setup-error-${routineId}`
      });
      
      setTimeout(() => {
        navigate('/treino');
      }, 2000);
    } finally {
      setIsLoading(false);
      setIsCreatingWorkout(false);
    }
  };
  
  // Initialize workout on mount
  useEffect(() => {
    if (!isInitialized && !isCreatingWorkout) {
      setupWorkout();
    }
  }, [routineId, isInitialized, isCreatingWorkout]);

  return {
    isLoading,
    loadError,
    exercises,
    setExercises,
    workoutId,
    isInitialized
  };
};
