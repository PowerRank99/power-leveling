
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkoutCompletion } from '../useWorkoutCompletion';
import { useState } from 'react';

const TIMEOUT_MS = 10000; // 10 seconds timeout for operations

// Modified timeout function that properly handles Supabase queries
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
  
  const finishWorkout = async (elapsedTime: number, restTimerSettings: { minutes: number, seconds: number }) => {
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate request");
      return false;
    }
    
    try {
      setIsSubmitting(true);
      
      if (!workoutId) {
        toast.error("Erro ao finalizar", {
          description: "ID do treino não encontrado"
        });
        return false;
      }
      
      // Save timer settings first
      try {
        await withTimeout(
          async () => {
            const { error } = await supabase
              .from('workouts')
              .update({
                rest_timer_minutes: restTimerSettings.minutes,
                rest_timer_seconds: restTimerSettings.seconds
              } as any)
              .eq('id', workoutId);
              
            if (error) throw error;
            return true;
          },
          TIMEOUT_MS
        );
      } catch (timerError) {
        console.error("Error or timeout saving timer settings:", timerError);
        // Continue even if timer settings fail - this is non-critical
      }
      
      // Finish the workout
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
  };

  const discardWorkout = async () => {
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
      
      // Delete sets
      try {
        await withTimeout(
          async () => {
            const { error } = await supabase
              .from('workout_sets')
              .delete()
              .eq('workout_id', workoutId);
              
            if (error) throw error;
            return true;
          },
          TIMEOUT_MS
        );
      } catch (setsError) {
        console.error("Error or timeout deleting workout sets:", setsError);
        throw new Error("Erro ao excluir séries do treino");
      }
      
      // Delete workout
      try {
        await withTimeout(
          async () => {
            const { error } = await supabase
              .from('workouts')
              .delete()
              .eq('id', workoutId);
              
            if (error) throw error;
            return true;
          },
          TIMEOUT_MS
        );
      } catch (workoutError) {
        console.error("Error or timeout deleting workout:", workoutError);
        throw new Error("Erro ao excluir treino");
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
  };
  
  return {
    finishWorkout,
    discardWorkout,
    isSubmitting
  };
};
