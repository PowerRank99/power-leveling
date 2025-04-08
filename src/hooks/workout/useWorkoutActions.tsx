
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkoutCompletion } from '../useWorkoutCompletion';
import { useState, useCallback } from 'react';

const TIMEOUT_MS = 10000; // 10 seconds timeout for operations

// Modified timeout function with proper generic typing
const withTimeout = async <T,>(promiseFactory: () => Promise<T>, ms: number): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Request timed out')), ms);
  });
  
  try {
    const resultPromise = promiseFactory();
    const result = await Promise.race([resultPromise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const useWorkoutActions = (workoutId: string | null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { finishWorkout: finishWorkoutAction } = useWorkoutCompletion(workoutId);
  
  const finishWorkout = useCallback(async (elapsedTime: number) => {
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate request");
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log(`Finishing workout: ${workoutId} with duration: ${elapsedTime}`);
      
      if (!workoutId) {
        toast.error("Erro ao finalizar", {
          description: "ID do treino não encontrado"
        });
        return false;
      }
      
      // Proceed with finishing the workout
      const success = await finishWorkoutAction(elapsedTime);
      
      if (success) {
        toast.success("Treino finalizado!", {
          description: "Seu treino foi salvo com sucesso."
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error finishing workout:", error);
      toast.error("Erro ao finalizar", {
        description: "Ocorreu um erro. Tente novamente."
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, workoutId, finishWorkoutAction]);

  const discardWorkout = useCallback(async () => {
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate request");
      return false;
    }
    
    if (!workoutId) {
      toast.error("Erro ao descartar treino", {
        description: "ID do treino não encontrado"
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Discarding workout:", workoutId);
      
      // Delete sets and workout directly with separate queries instead of using RPC
      try {
        await withTimeout(
          async () => {
            // First delete all sets associated with this workout
            const { error: setsError } = await supabase
              .from('workout_sets')
              .delete()
              .eq('workout_id', workoutId);
              
            if (setsError) throw setsError;
            
            // Then delete the workout itself
            const { error: workoutError } = await supabase
              .from('workouts')
              .delete()
              .eq('id', workoutId);
              
            if (workoutError) throw workoutError;
            
            return true;
          },
          TIMEOUT_MS
        );
      } catch (error) {
        console.error("Error or timeout deleting workout:", error);
        throw new Error("Erro ao excluir treino e suas séries");
      }
      
      return true;
    } catch (error) {
      console.error("Error discarding workout:", error);
      toast.error("Erro ao descartar treino", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, workoutId]);
  
  return {
    finishWorkout,
    discardWorkout,
    isSubmitting
  };
};
