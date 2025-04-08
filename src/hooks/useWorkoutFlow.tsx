
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
    updateSet,
    addSet,
    removeSet,
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
