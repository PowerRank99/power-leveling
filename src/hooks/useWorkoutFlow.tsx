
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkout } from '@/hooks/useWorkout';
import { toast } from 'sonner';

export const useWorkoutFlow = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  
  const {
    isLoading,
    loadError,
    exercises,
    currentExerciseIndex,
    totalExercises,
    updateSet: updateSetBase,
    addSet: addSetBase,
    removeSet: removeSetBase,
    finishWorkout: finishWorkoutBase,
    discardWorkout: discardWorkoutBase,
    formatTime,
    elapsedTime,
    restTimerSettings,
    handleRestTimerChange,
    isSubmitting,
    isTimerSaving
  } = useWorkout(id || '');
  
  useEffect(() => {
    if (!id) {
      toast.error("Erro na rota", {
        description: "ID da rotina não encontrado na URL."
      });
      navigate('/treino');
    }
  }, [id, navigate]);
  
  // Wrapper functions to handle type compatibility and error handling
  const updateSet = async (exerciseIndex: number, setIndex: number, data: { weight?: string; reps?: string; completed?: boolean }) => {
    try {
      console.log("Updating set:", exerciseIndex, setIndex, data);
      return await updateSetBase(exerciseIndex, setIndex, data);
    } catch (error) {
      console.error("Error updating set in flow:", error);
      return null;
    }
  };
  
  const addSet = async (exerciseIndex: number) => {
    try {
      console.log("Adding set to exercise:", exerciseIndex);
      return await addSetBase(exerciseIndex);
    } catch (error) {
      console.error("Error adding set in flow:", error);
      return null;
    }
  };
  
  const removeSet = async (exerciseIndex: number, setIndex: number) => {
    try {
      console.log("Removing set:", exerciseIndex, setIndex);
      return await removeSetBase(exerciseIndex, setIndex);
    } catch (error) {
      console.error("Error removing set in flow:", error);
      return null;
    }
  };
  
  const finishWorkout = async () => {
    if (isLocalSubmitting || isSubmitting) {
      console.log("Already submitting, ignoring duplicate request");
      return false;
    }

    try {
      setIsLocalSubmitting(true);
      console.log("Starting workout finish process...");
      const success = await finishWorkoutBase();
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
      const success = await discardWorkoutBase();
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
    id,
    isLoading,
    loadError,
    exercises,
    currentExerciseIndex,
    totalExercises,
    updateSet,
    addSet,
    removeSet,
    finishWorkout,
    discardWorkout,
    formatTime,
    elapsedTime,
    restTimerSettings,
    handleRestTimerChange,
    isSubmitting,
    isTimerSaving,
    notes,
    setNotes,
    isLocalSubmitting
  };
};
