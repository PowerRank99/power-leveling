
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkoutCompletion } from '../useWorkoutCompletion';
import { useState, useCallback } from 'react';

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
  
  const finishWorkout = useCallback(async (elapsedTime: number, restTimerSettings: { minutes: number, seconds: number }) => {
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
      
      // First, ensure the timer settings are saved
      try {
        console.log(`Saving final timer settings: ${restTimerSettings.minutes}m ${restTimerSettings.seconds}s`);
        const { error: timerError } = await supabase
          .from('workouts')
          .update({
            rest_timer_minutes: restTimerSettings.minutes,
            rest_timer_seconds: restTimerSettings.seconds
          })
          .eq('id', workoutId);
          
        if (timerError) {
          console.error("Error saving timer settings:", timerError);
          // Continue with workout completion even if timer settings fail
        }
      } catch (timerError) {
        console.error("Exception saving timer settings:", timerError);
        // Continue with workout completion even if timer settings fail
      }
      
      // Proceed with finishing the workout
      console.log("Calling finishWorkoutAction...");
      const { success, error } = await finishWorkoutAction(elapsedTime);
      console.log("finishWorkoutAction result:", { success, error });
      
      if (success) {
        toast.success("Treino finalizado!", {
          description: "Seu treino foi salvo com sucesso."
        });
        return true;
      } else {
        console.error("Error from finishWorkoutAction:", error);
        toast.error("Erro ao finalizar", {
          description: error || "Ocorreu um erro. Tente novamente."
        });
        return false;
      }
    } catch (error) {
      console.error("Exception in finishWorkout:", error);
      toast.error("Erro ao finalizar", {
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente."
      });
      return false;
    } finally {
      // Always ensure isSubmitting is reset to false
      console.log("Resetting isSubmitting state to false");
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
      
      // Delete sets
      try {
        console.log("Deleting workout sets...");
        await withTimeout(
          async () => {
            const { error } = await supabase
              .from('workout_sets')
              .delete()
              .eq('workout_id', workoutId);
              
            if (error) {
              console.error("Error deleting workout sets:", error);
              throw error;
            }
            console.log("Workout sets deleted successfully");
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
        console.log("Deleting workout...");
        await withTimeout(
          async () => {
            const { error } = await supabase
              .from('workouts')
              .delete()
              .eq('id', workoutId);
              
            if (error) {
              console.error("Error deleting workout:", error);
              throw error;
            }
            console.log("Workout deleted successfully");
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
      // Always ensure isSubmitting is reset to false
      console.log("Resetting isSubmitting state to false");
      setIsSubmitting(false);
    }
  }, [isSubmitting, workoutId]);
  
  return {
    finishWorkout,
    discardWorkout,
    isSubmitting
  };
};
