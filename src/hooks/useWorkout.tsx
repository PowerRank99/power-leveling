
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutExercise } from '@/types/workout';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useWorkoutCompletion } from './useWorkoutCompletion';
import { useWorkoutExercises } from './useWorkoutExercises';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePreviousWorkoutData } from './workout/usePreviousWorkoutData';

export type { WorkoutExercise } from '@/types/workout';

export const useWorkout = (routineId: string) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast: uiToast } = useToast();
  const [restTimerSettings, setRestTimerSettings] = useState({ minutes: 1, seconds: 30 });
  
  const { elapsedTime, formatTime } = useWorkoutTimer();
  const { finishWorkout: finishWorkoutAction } = useWorkoutCompletion(workoutId);
  const { fetchRoutineExercises, isCreatingWorkout } = useWorkoutExercises();

  const { previousWorkoutData, restTimerSettings: savedRestTimerSettings } = usePreviousWorkoutData(routineId);
  
  useEffect(() => {
    if (savedRestTimerSettings) {
      setRestTimerSettings(savedRestTimerSettings);
    }
  }, [savedRestTimerSettings]);

  const setupWorkout = useCallback(async () => {
    if (!routineId) {
      setLoadError("ID da rotina não fornecido");
      setIsLoading(false);
      return;
    }

    if (isInitialized || isCreatingWorkout) {
      console.log("Workout already initialized or in progress, skipping setup");
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      
      console.log("Setting up workout for routine:", routineId);
      const { workoutExercises, workoutId: newWorkoutId } = await fetchRoutineExercises(routineId);
      
      if (workoutExercises && workoutExercises.length > 0 && newWorkoutId) {
        console.log("Workout setup successful with", workoutExercises.length, "exercises");
        
        if (Object.keys(previousWorkoutData).length > 0) {
          const exercisesWithPrevious = workoutExercises.map(exercise => {
            const previousSets = previousWorkoutData[exercise.id];
            
            if (previousSets) {
              return {
                ...exercise,
                sets: exercise.sets.map((set, idx) => {
                  const prevSet = previousSets[idx];
                  
                  if (prevSet) {
                    return {
                      ...set,
                      weight: prevSet.weight,
                      reps: prevSet.reps,
                      previous: {
                        weight: prevSet.weight,
                        reps: prevSet.reps
                      }
                    };
                  }
                  
                  return set;
                })
              };
            }
            
            return exercise;
          });
          
          setExercises(exercisesWithPrevious);
        } else {
          setExercises(workoutExercises);
        }
        
        setWorkoutId(newWorkoutId);
        setIsInitialized(true);
      } else {
        throw new Error("Não foi possível iniciar o treino. Verifique se a rotina possui exercícios.");
      }
    } catch (error: any) {
      console.error("Error in setupWorkout:", error);
      setLoadError(error.message || "Erro ao iniciar treino");
      
      toast.error("Erro ao carregar treino", {
        description: "Não foi possível iniciar seu treino. Tente novamente."
      });
      
      setTimeout(() => {
        navigate('/treino');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  }, [routineId, fetchRoutineExercises, navigate, isInitialized, isCreatingWorkout, previousWorkoutData]);
  
  useEffect(() => {
    if (!isInitialized && !isCreatingWorkout) {
      setupWorkout();
    }
  }, [setupWorkout, isInitialized, isCreatingWorkout]);
  
  const updateSet = async (exerciseIndex: number, setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    try {
      if (!workoutId || !exercises[exerciseIndex]) {
        toast.error("Erro ao atualizar série", {
          description: "Treino ou exercício não encontrado"
        });
        return;
      }
      
      const currentExercise = exercises[exerciseIndex];
      
      const updatedExercises = [...exercises];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        ...data
      };
      
      updatedExercises[exerciseIndex].sets = updatedSets;
      setExercises(updatedExercises);
      
      const setData: Record<string, any> = {};
      if (data.weight !== undefined) setData.weight = parseFloat(data.weight) || 0;
      if (data.reps !== undefined) setData.reps = parseInt(data.reps) || 0;
      if (data.completed !== undefined) {
        setData.completed = data.completed;
        if (data.completed) {
          setData.completed_at = new Date().toISOString();
        } else {
          setData.completed_at = null;
        }
      }
      
      const { error } = await supabase
        .from('workout_sets')
        .update(setData)
        .eq('id', updatedSets[setIndex].id);
        
      if (error) {
        console.error("Error updating set:", error);
        toast.error("Erro ao salvar série", {
          description: "As alterações podem não ter sido salvas"
        });
      }
    } catch (error) {
      console.error("Error updating set:", error);
      toast.error("Erro ao atualizar série", {
        description: "Não foi possível salvar as alterações"
      });
    }
  };
  
  const addSet = async (exerciseIndex: number) => {
    try {
      if (!workoutId || !exercises[exerciseIndex]) {
        toast.error("Erro ao adicionar série", {
          description: "Treino ou exercício não encontrado"
        });
        return;
      }
      
      const currentExercise = exercises[exerciseIndex];
      
      const updatedExercises = [...exercises];
      const currentSets = updatedExercises[exerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      
      const newSetId = `new-${Date.now()}`;
      const newSet = {
        id: newSetId,
        weight: lastSet?.weight || '0',
        reps: lastSet?.reps || '12',
        completed: false,
        previous: lastSet?.previous || { weight: '0', reps: '12' }
      };
      
      updatedExercises[exerciseIndex].sets.push(newSet);
      setExercises(updatedExercises);
      
      const newSetOrder = currentSets.length;
      
      const { data, error } = await supabase
        .from('workout_sets')
        .insert({
          workout_id: workoutId,
          exercise_id: currentExercise.id,
          set_order: newSetOrder,
          weight: parseFloat(newSet.weight) || 0,
          reps: parseInt(newSet.reps) || 0,
          completed: false
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error adding new set:", error);
        toast.error("Erro ao adicionar série", {
          description: "A série pode não ter sido salva corretamente"
        });
      }
      
      if (data) {
        const updatedExercisesWithId = [...exercises];
        const setIndex = updatedExercisesWithId[exerciseIndex].sets.length - 1;
        updatedExercisesWithId[exerciseIndex].sets[setIndex].id = data.id;
        setExercises(updatedExercisesWithId);
        
        updateRoutineExerciseSetCount(currentExercise.id, routineId, currentSets.length + 1);
      }
    } catch (error) {
      console.error("Error adding set:", error);
      toast.error("Erro ao adicionar série", {
        description: "Não foi possível adicionar uma nova série"
      });
    }
  };
  
  const removeSet = async (exerciseIndex: number, setIndex: number) => {
    try {
      if (!workoutId || !exercises[exerciseIndex]) {
        toast.error("Erro ao remover série", {
          description: "Treino ou exercício não encontrado"
        });
        return;
      }
      
      const currentExercise = exercises[exerciseIndex];
      const setId = currentExercise.sets[setIndex].id;
      
      if (currentExercise.sets.length <= 1) {
        toast.error("Não é possível remover", {
          description: "Deve haver pelo menos uma série"
        });
        return;
      }
      
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex].sets = [
        ...currentExercise.sets.slice(0, setIndex),
        ...currentExercise.sets.slice(setIndex + 1)
      ];
      
      setExercises(updatedExercises);
      
      const { error } = await supabase
        .from('workout_sets')
        .delete()
        .eq('id', setId);
      
      if (error) {
        console.error("Error removing set:", error);
        toast.error("Erro ao remover série", {
          description: "A série pode não ter sido removida corretamente"
        });
      } else {
        updateRoutineExerciseSetCount(currentExercise.id, routineId, currentExercise.sets.length - 1);
      }
    } catch (error) {
      console.error("Error removing set:", error);
      toast.error("Erro ao remover série", {
        description: "Não foi possível remover a série"
      });
    }
  };
  
  const updateRoutineExerciseSetCount = async (exerciseId: string, routineId: string, newSetCount: number) => {
    try {
      const { error } = await supabase
        .from('routine_exercises')
        .update({ target_sets: newSetCount })
        .eq('routine_id', routineId)
        .eq('exercise_id', exerciseId);
      
      if (error) {
        console.error("Error updating routine exercise set count:", error);
      }
    } catch (error) {
      console.error("Error updating routine exercise set count:", error);
    }
  };
  
  const handleRestTimerChange = (minutes: number, seconds: number) => {
    setRestTimerSettings({ minutes, seconds });
    
    if (workoutId) {
      supabase
        .from('workouts')
        .update({
          rest_timer_minutes: minutes,
          rest_timer_seconds: seconds
        } as any) // Use type assertion to bypass TypeScript error
        .eq('id', workoutId)
        .then(({ error }) => {
          if (error) {
            console.error("Error saving timer settings:", error);
          }
        });
    }
  };
  
  const finishWorkout = async () => {
    try {
      if (workoutId) {
        await supabase
          .from('workouts')
          .update({
            rest_timer_minutes: restTimerSettings.minutes,
            rest_timer_seconds: restTimerSettings.seconds
          } as any) // Use type assertion to bypass TypeScript error
          .eq('id', workoutId);
      }
      
      const success = await finishWorkoutAction(elapsedTime);
      if (success) {
        toast.success("Treino finalizado!", {
          description: "Seu treino foi salvo com sucesso."
        });
      }
      return success;
    } catch (error) {
      console.error("Error finishing workout:", error);
      return false;
    }
  };

  const discardWorkout = async () => {
    if (!workoutId) {
      toast.error("Erro ao descartar treino", {
        description: "ID do treino não encontrado"
      });
      return false;
    }
    
    try {
      console.log("Discarding workout:", workoutId);
      
      const { error: setsError } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_id', workoutId);
        
      if (setsError) {
        console.error("Error deleting workout sets:", setsError);
        throw new Error("Erro ao excluir séries do treino");
      }
      
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (workoutError) {
        console.error("Error deleting workout:", workoutError);
        throw new Error("Erro ao excluir treino");
      }
      
      return true;
    } catch (error) {
      console.error("Error discarding workout:", error);
      throw error;
    }
  };
  
  return {
    isLoading,
    loadError,
    exercises,
    currentExerciseIndex,
    totalExercises: exercises.length,
    updateSet,
    addSet,
    removeSet,
    finishWorkout,
    discardWorkout,
    elapsedTime,
    formatTime,
    restTimerSettings,
    handleRestTimerChange
  };
};
