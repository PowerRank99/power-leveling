
import { useState } from 'react';
import { useWorkoutCompletion } from '../useWorkoutCompletion';
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
  const { finishWorkout: finishWorkoutAction } = useWorkoutCompletion(workoutId);
  
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
        setTimeout(() => {
          navigate('/treino');
        }, 1500);
        
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
    try {
      console.log("Discarding workout with ID:", workoutId);
      toast.success("Treino descartado", {
        description: "Você foi redirecionado para a página inicial."
      });
      
      navigate('/treino');
      return true;
    } catch (error) {
      console.error("Error discarding workout:", error);
      return false;
    }
  };
  
  return {
    finishWorkout,
    discardWorkout,
    isSubmitting
  };
};
