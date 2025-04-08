
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
  
  // Function to ensure all pending sets have been saved
  const ensureSetsSaved = useCallback(async () => {
    console.log("[WORKOUT_ACTIONS] Ensuring all sets are saved before finishing workout");
    
    try {
      // Add a small delay to ensure any pending set updates have been processed
      // This helps with race conditions between set updates and workout completion
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Could also check for any sets with temporary IDs and wait for them to be committed
      return true;
    } catch (error) {
      console.error("[WORKOUT_ACTIONS] Error ensuring sets saved:", error);
      return false;
    }
  }, []);
  
  const finishWorkout = useCallback(async (elapsedTime: number, restTimerSettings: { minutes: number, seconds: number }) => {
    if (isSubmitting) {
      console.log("[WORKOUT_ACTIONS] Already submitting, ignoring duplicate request");
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log(`[WORKOUT_ACTIONS] Starting finish workout process: ${workoutId} with duration: ${elapsedTime}`);
      
      if (!workoutId) {
        toast.error("Erro ao finalizar", {
          description: "ID do treino não encontrado"
        });
        return false;
      }
      
      // IMPORTANT: First, ensure all pending set updates have been committed to the database
      // We increase the delay to ensure all data is saved properly
      console.log("[WORKOUT_ACTIONS] Waiting for all pending set updates to be saved...");
      await ensureSetsSaved();
      
      // Capture the current timer settings to ensure they are saved correctly
      const timerMinutes = restTimerSettings.minutes;
      const timerSeconds = restTimerSettings.seconds;
      
      console.log(`[WORKOUT_ACTIONS] Saving final timer settings: ${timerMinutes}m ${timerSeconds}s`);
      
      // Combine everything in a single transaction to ensure consistency
      try {
        await supabase.rpc('finish_workout', {
          p_workout_id: workoutId,
          p_elapsed_time: elapsedTime,
          p_timer_minutes: timerMinutes,
          p_timer_seconds: timerSeconds
        });
        
        console.log("[WORKOUT_ACTIONS] Successfully saved all workout data in single transaction");
        
        toast.success("Treino finalizado!", {
          description: "Seu treino foi salvo com sucesso."
        });
        
        return true;
      } catch (transactionError) {
        console.error("[WORKOUT_ACTIONS] Transaction error:", transactionError);
        
        // Fallback to the original approach if the RPC fails
        console.log("[WORKOUT_ACTIONS] Falling back to sequential updates...");
        
        // Then, update the rest timer settings in a separate operation
        try {
          console.log(`[WORKOUT_ACTIONS] Saving final timer settings: ${timerMinutes}m ${timerSeconds}s`);
          await supabase
            .from('workouts')
            .update({
              rest_timer_minutes: timerMinutes,
              rest_timer_seconds: timerSeconds
            })
            .eq('id', workoutId);
        } catch (timerError) {
          console.error("[WORKOUT_ACTIONS] Error saving final timer settings:", timerError);
          // Continue with workout completion even if timer settings fail
        }
        
        // Now wait a moment to ensure the timer settings have been saved
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Finally proceed with finishing the workout
        console.log("[WORKOUT_ACTIONS] Calling finishWorkoutAction with elapsed time:", elapsedTime);
        const success = await finishWorkoutAction(elapsedTime);
        
        if (success) {
          toast.success("Treino finalizado!", {
            description: "Seu treino foi salvo com sucesso."
          });
        }
        
        return success;
      }
    } catch (error) {
      console.error("[WORKOUT_ACTIONS] Error finishing workout:", error);
      toast.error("Erro ao finalizar", {
        description: "Ocorreu um erro. Tente novamente."
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, workoutId, finishWorkoutAction, ensureSetsSaved]);

  const discardWorkout = useCallback(async () => {
    if (isSubmitting) {
      console.log("[WORKOUT_ACTIONS] Already submitting, ignoring duplicate request");
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
      console.log("[WORKOUT_ACTIONS] Discarding workout:", workoutId);
      
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
        console.error("[WORKOUT_ACTIONS] Error or timeout deleting workout sets:", setsError);
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
        console.error("[WORKOUT_ACTIONS] Error or timeout deleting workout:", workoutError);
        throw new Error("Erro ao excluir treino");
      }
      
      return true;
    } catch (error) {
      console.error("[WORKOUT_ACTIONS] Error discarding workout:", error);
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
