
import { useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutExercise } from '@/types/workout';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useWorkoutExercises } from './useWorkoutExercises';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useWorkoutState } from './useWorkoutState';
import { useWorkoutInitialization } from './useWorkoutInitialization';
import { useRestTimer } from './workout/useRestTimer';
import { useWorkoutActions } from './workout/useWorkoutActions';
import { usePreviousWorkoutData } from './workout/usePreviousWorkoutData';
import { useWorkoutSetsManagement } from './workout/useWorkoutSetsManagement';

export type { WorkoutExercise } from '@/types/workout';

export const useWorkout = (routineId: string) => {
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { isCreatingWorkout } = useWorkoutExercises();
  
  // Use the extracted state management hook
  const {
    isLoading, setIsLoading,
    loadError, setLoadError,
    exercises, setExercises,
    currentExerciseIndex, setCurrentExerciseIndex,
    workoutId, setWorkoutId,
    isInitialized, setIsInitialized,
    isLocalSubmitting, setIsLocalSubmitting
  } = useWorkoutState();
  
  // Use separate hooks for different functionalities
  const { elapsedTime, formatTime } = useWorkoutTimer();
  const { setupWorkout } = useWorkoutInitialization(
    routineId,
    isInitialized,
    isCreatingWorkout,
    setIsLoading,
    setLoadError,
    setExercises,
    setWorkoutId,
    setIsInitialized
  );
  
  const { restTimerSettings, setRestTimerSettings, handleRestTimerChange, isSaving: isTimerSaving } = useRestTimer(workoutId);
  const { finishWorkout: finishWorkoutAction, discardWorkout: discardWorkoutAction, isSubmitting } = useWorkoutActions(workoutId);
  const { previousWorkoutData, restTimerSettings: savedRestTimerSettings } = usePreviousWorkoutData(routineId);
  
  // Set up the workout sets management
  const { updateSet, addSet, removeSet } = useWorkoutSetsManagement(workoutId, exercises, currentExerciseIndex);
  
  // Apply saved rest timer settings
  useEffect(() => {
    if (savedRestTimerSettings) {
      setRestTimerSettings(savedRestTimerSettings);
    }
  }, [savedRestTimerSettings, setRestTimerSettings]);
  
  // Wrapper functions to maintain the original API
  const finishWorkout = async () => {
    if (isLocalSubmitting || isSubmitting) {
      console.log("Already submitting, ignoring duplicate request");
      return false;
    }

    try {
      setIsLocalSubmitting(true);
      console.log("Starting workout finish process...");
      const success = await finishWorkoutAction(elapsedTime, restTimerSettings);
      console.log("Finish workout result:", success);
      
      if (success) {
        toast.success("Treino Completo!", {
          description: "Seu treino foi salvo com sucesso.",
        });
        
        // Wait a brief moment before navigation to ensure state updates and toasts are visible
        setTimeout(() => {
          if (!isLocalSubmitting) { // Double-check we're not in submitting state
            navigate('/treino');
          }
        }, 1500);
        return true;
      } else {
        toast.error("Erro ao finalizar treino", {
          description: "Ocorreu um erro ao salvar seu treino.",
        });
        return false;
      }
    } catch (error) {
      console.error("Error in handleFinishWorkout:", error);
      toast.error("Erro ao finalizar treino", {
        description: "Ocorreu um erro ao salvar seu treino.",
      });
      return false;
    } finally {
      console.log("Resetting local submitting state");
      setIsLocalSubmitting(false);
    }
  };

  const discardWorkout = async () => {
    if (isLocalSubmitting || isSubmitting) {
      console.log("Already submitting, ignoring duplicate request");
      return false;
    }

    try {
      setIsLocalSubmitting(true);
      console.log("Starting workout discard process...");
      const success = await discardWorkoutAction();
      console.log("Discard workout result:", success);
      
      if (success) {
        toast.info("Treino descartado", {
          description: "O treino foi descartado com sucesso.",
        });
        
        // Wait a brief moment before navigation to ensure state updates and toasts are visible
        setTimeout(() => {
          if (!isLocalSubmitting) { // Double-check we're not in submitting state
            navigate('/treino');
          }
        }, 1500);
        return true;
      } else {
        toast.error("Erro ao descartar treino", {
          description: "Ocorreu um erro ao descartar o treino.",
        });
        return false;
      }
    } catch (error) {
      console.error("Error discarding workout:", error);
      toast.error("Erro ao descartar treino", {
        description: "Não foi possível descartar o treino.",
      });
      return false;
    } finally {
      console.log("Resetting local submitting state");
      setIsLocalSubmitting(false);
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
    handleRestTimerChange,
    isSubmitting,
    isTimerSaving,
    isLocalSubmitting
  };
};
