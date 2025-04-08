
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '@/types/workoutTypes';
import { useWorkoutTimer } from './useWorkoutTimer';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSetPersistence } from './workout/useSetPersistence';
import { useWorkoutDataFetching } from './workout/useWorkoutDataFetching';

/**
 * A comprehensive hook that manages all workout operations with reliable persistence
 */
export const useWorkoutManager = (routineId: string) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Import our specialized hooks
  const { elapsedTime, formatTime } = useWorkoutTimer();
  const { updateSet, addSet, removeSet, isProcessing } = useSetPersistence(workoutId);
  const { fetchWorkoutExercises } = useWorkoutDataFetching();
  
  /**
   * Initialize or find an existing workout
   */
  const setupWorkout = useCallback(async () => {
    if (!routineId) {
      setLoadError("ID da rotina não fornecido");
      setIsLoading(false);
      return;
    }

    if (isInitialized || isCreatingWorkout) {
      console.log("[useWorkoutManager] Workout already initialized or in progress, skipping setup");
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      setIsCreatingWorkout(true);
      
      console.log("[useWorkoutManager] Setting up workout for routine:", routineId);
      
      // Check if routine exists and user has access
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .select('id, name')
        .eq('id', routineId)
        .single();
      
      if (routineError || !routineData) {
        throw new Error("Rotina não encontrada ou acesso negado");
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
        console.log("[useWorkoutManager] Found existing workout:", existingWorkout[0].id);
        currentWorkoutId = existingWorkout[0].id;
      }
      // Create new workout
      else {
        console.log("[useWorkoutManager] Creating new workout for routine:", routineId);
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
        console.log("[useWorkoutManager] Created new workout:", currentWorkoutId);
        
        // Update routine's last used timestamp
        await supabase
          .from('routines')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', routineId);
      }
      
      // Fetch routine exercises
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
      
      // Fetch all workout data with proper set information
      const workoutExercises = await fetchWorkoutExercises(currentWorkoutId, routineExercises);
      
      // Set state with fetched data
      setWorkoutId(currentWorkoutId);
      setExercises(workoutExercises);
      setIsInitialized(true);
      
    } catch (error: any) {
      console.error("[useWorkoutManager] Error in setupWorkout:", error);
      setLoadError(error.message || "Erro ao iniciar treino");
      
      toast.error("Erro ao carregar treino", {
        description: "Não foi possível iniciar seu treino. Tente novamente."
      });
      
      setTimeout(() => {
        navigate('/treino');
      }, 3000);
    } finally {
      setIsLoading(false);
      setIsCreatingWorkout(false);
    }
  }, [routineId, fetchWorkoutExercises, navigate, isInitialized, isCreatingWorkout]);
  
  // Initialize workout on mount
  useEffect(() => {
    if (!isInitialized && !isCreatingWorkout) {
      setupWorkout();
    }
  }, [setupWorkout, isInitialized, isCreatingWorkout]);
  
  /**
   * Handles adding a new set to an exercise
   */
  const handleAddSet = async (exerciseIndex: number) => {
    if (isProcessing) return;
    console.log(`[useWorkoutManager] Adding set for exercise index ${exerciseIndex}`);
    
    const result = await addSet(exerciseIndex, exercises, routineId);
    if (result) {
      setExercises(result);
    }
  };
  
  /**
   * Handles removing a set from an exercise
   */
  const handleRemoveSet = async (exerciseIndex: number, setIndex: number) => {
    if (isProcessing) return;
    console.log(`[useWorkoutManager] Removing set ${setIndex} from exercise ${exerciseIndex}`);
    
    const result = await removeSet(exerciseIndex, exercises, setIndex, routineId);
    if (result) {
      setExercises(result);
    }
  };
  
  /**
   * Handles updating a set's data
   */
  const handleUpdateSet = async (exerciseIndex: number, setIndex: number, data: { weight?: string; reps?: string }) => {
    if (isProcessing) return;
    
    const result = await updateSet(exerciseIndex, exercises, setIndex, data);
    if (result) {
      setExercises(result);
    }
  };
  
  /**
   * Handles marking a set as completed
   */
  const handleCompleteSet = async (exerciseIndex: number, setIndex: number) => {
    if (isProcessing) return;
    
    const currentExercise = exercises[exerciseIndex];
    if (currentExercise) {
      const newCompleted = !currentExercise.sets[setIndex].completed;
      console.log(`[useWorkoutManager] Setting complete=${newCompleted} for exercise ${exerciseIndex}, set ${setIndex}`);
      
      const result = await updateSet(exerciseIndex, exercises, setIndex, { 
        completed: newCompleted
      });
      
      if (result) {
        setExercises(result);
      }
    }
  };
  
  /**
   * Handles updating exercise notes
   */
  const handleNotesChange = (exerciseId: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [exerciseId]: value
    }));
  };
  
  /**
   * Finishes the current workout
   */
  const finishWorkout = async () => {
    if (!workoutId) {
      toast.error("Erro ao finalizar treino", {
        description: "Treino não encontrado"
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      
      console.log("[useWorkoutManager] Finishing workout:", workoutId);
      const { error } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: elapsedTime
        })
        .eq('id', workoutId);
        
      if (error) {
        console.error("[useWorkoutManager] Error finishing workout:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("[useWorkoutManager] Exception finishing workout:", error);
      toast.error("Erro ao finalizar treino", {
        description: "Ocorreu um problema ao salvar seu treino."
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Discards the current workout
   */
  const discardWorkout = async () => {
    if (!workoutId) {
      return false;
    }
    
    try {
      setIsSubmitting(true);
      
      console.log("[useWorkoutManager] Discarding workout:", workoutId);
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (error) {
        console.error("[useWorkoutManager] Error discarding workout:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("[useWorkoutManager] Exception discarding workout:", error);
      toast.error("Erro ao descartar treino", {
        description: "Ocorreu um problema ao descartar seu treino."
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isLoading,
    loadError,
    exercises,
    currentExerciseIndex,
    totalExercises: exercises.length,
    handleUpdateSet,
    handleAddSet,
    handleRemoveSet,
    handleCompleteSet,
    handleNotesChange,
    finishWorkout,
    discardWorkout,
    elapsedTime,
    formatTime,
    isSubmitting,
    notes,
    workoutId
  };
};
