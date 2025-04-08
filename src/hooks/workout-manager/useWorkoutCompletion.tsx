
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';

/**
 * Hook responsible for handling workout completion or discarding
 */
export const useWorkoutCompletion = (
  workoutId: string | null, 
  elapsedTime: number,
  navigate: NavigateFunction
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      console.log("[useWorkoutCompletion] Finishing workout:", workoutId);
      const { error } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: elapsedTime
        })
        .eq('id', workoutId);
        
      if (error) {
        console.error("[useWorkoutCompletion] Error finishing workout:", error);
        throw error;
      }
      
      toast.success("Treino Completo!", {
        description: "Seu treino foi salvo com sucesso.",
      });
      navigate('/treino');
      
      return true;
    } catch (error) {
      console.error("[useWorkoutCompletion] Exception finishing workout:", error);
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
      
      console.log("[useWorkoutCompletion] Discarding workout:", workoutId);
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (error) {
        console.error("[useWorkoutCompletion] Error discarding workout:", error);
        throw error;
      }
      
      toast.info("Treino descartado", {
        description: "O treino foi descartado com sucesso.",
      });
      navigate('/treino');
      
      return true;
    } catch (error) {
      console.error("[useWorkoutCompletion] Exception discarding workout:", error);
      toast.error("Erro ao descartar treino", {
        description: "Ocorreu um problema ao descartar seu treino."
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
