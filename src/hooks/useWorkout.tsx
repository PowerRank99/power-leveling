
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutExercise } from '@/types/workout';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useWorkoutExercises } from './useWorkoutExercises';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSetManagement } from './workout/useSetManagement';
import { useRestTimer } from './workout/useRestTimer';
import { useWorkoutActions } from './workout/useWorkoutActions';
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
  
  const { elapsedTime, formatTime } = useWorkoutTimer();
  const { fetchRoutineExercises, isCreatingWorkout } = useWorkoutExercises();
  const { updateSet: updateSetAction, addSet: addSetAction, removeSet: removeSetAction } = useSetManagement(workoutId);
  const { restTimerSettings, setRestTimerSettings, handleRestTimerChange } = useRestTimer(workoutId);
  const { finishWorkout: finishWorkoutAction, discardWorkout: discardWorkoutAction, isSubmitting } = useWorkoutActions(workoutId);
  const { previousWorkoutData, restTimerSettings: savedRestTimerSettings } = usePreviousWorkoutData(routineId);
  
  useEffect(() => {
    if (savedRestTimerSettings) {
      setRestTimerSettings(savedRestTimerSettings);
    }
  }, [savedRestTimerSettings, setRestTimerSettings]);

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
  
  // Wrapper functions to maintain the original API while using the new hooks
  const updateSet = async (exerciseIndex: number, setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    const result = await updateSetAction(exerciseIndex, exercises, setIndex, data);
    if (result) {
      setExercises(result);
    }
  };
  
  const addSet = async (exerciseIndex: number) => {
    const result = await addSetAction(exerciseIndex, exercises, routineId);
    if (result) {
      setExercises(result);
    }
  };
  
  const removeSet = async (exerciseIndex: number, setIndex: number) => {
    const result = await removeSetAction(exerciseIndex, exercises, setIndex, routineId);
    if (result) {
      setExercises(result);
    }
  };
  
  const finishWorkout = async () => {
    return finishWorkoutAction(elapsedTime, restTimerSettings);
  };

  const discardWorkout = async () => {
    return discardWorkoutAction();
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
    handleRestTimerChange,
    isSubmitting
  };
};
