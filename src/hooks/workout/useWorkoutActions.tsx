
import { useState } from 'react';
import { useWorkoutCompletion } from '@/hooks/useWorkoutCompletion';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * Hook for workout completion and discard actions
 */
export const useWorkoutActions = (
  workoutId: string | null, 
  elapsedTime: number,
  navigate: NavigateFunction
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { finishWorkout: finishWorkoutAction, discardWorkout: discardWorkoutAction } = useWorkoutCompletion(workoutId);
  
  const finishWorkout = async () => {
    if (isSubmitting) return false;
    
    try {
      setIsSubmitting(true);
      console.log("Finishing workout with ID:", workoutId);
      
      const success = await finishWorkoutAction(elapsedTime);
      if (success) {
        toast.success("Treino finalizado com sucesso!", {
          description: "Os dados do seu treino foram salvos."
        });
        
        // Navigate to workout summary page
        navigate('/treino');
        return true;
      } else {
        throw new Error("Não foi possível finalizar o treino.");
      }
    } catch (error: any) {
      console.error("Error finishing workout:", error);
      toast.error("Erro ao finalizar treino", {
        description: error.message || "Ocorreu um erro ao salvar seu treino"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const discardWorkout = async () => {
    if (isSubmitting) return false;
    
    try {
      setIsSubmitting(true);
      console.log("Discarding workout with ID:", workoutId);
      
      const success = await discardWorkoutAction();
      if (success) {
        toast.success("Treino descartado", {
          description: "Você foi redirecionado para a página inicial."
        });
        
        // Navigate directly to workout page
        navigate('/treino');
        return true;
      } else {
        throw new Error("Não foi possível descartar o treino.");
      }
    } catch (error: any) {
      console.error("Error discarding workout:", error);
      toast.error("Erro ao descartar treino", {
        description: error.message || "Ocorreu um erro ao descartar seu treino"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    finishWorkout,
    discardWorkout,
    isSubmitting
  };
};
