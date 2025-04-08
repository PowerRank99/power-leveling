
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TIMEOUT_MS = 10000; // 10 seconds timeout for operations

// Custom timeout promise that works with both regular promises and Supabase queries
const withTimeout = <T,>(promiseFactory: () => Promise<T>, ms: number): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Request timed out')), ms);
  });
  
  return Promise.race([
    promiseFactory().then(result => {
      clearTimeout(timeoutId);
      return result;
    }),
    timeoutPromise
  ]);
};

export const useWorkoutCompletion = (workoutId: string | null) => {
  const finishWorkout = async (elapsedTime: number) => {
    if (!workoutId) {
      toast.error("Erro ao finalizar", {
        description: "ID do treino não encontrado"
      });
      return false;
    }
    
    try {
      console.log("Finishing workout:", workoutId, "with duration:", elapsedTime);
      
      // Check if the workout is already completed with timeout
      let workoutData;
      try {
        workoutData = await withTimeout(
          async () => {
            const { data, error } = await supabase
              .from('workouts')
              .select('completed_at')
              .eq('id', workoutId)
              .single();
              
            if (error) throw error;
            return data;
          },
          TIMEOUT_MS
        );
      } catch (checkError) {
        console.error("Error or timeout checking workout status:", checkError);
        throw new Error("Não foi possível verificar o estado do treino");
      }
      
      if (workoutData?.completed_at) {
        console.log("Workout already completed, skipping update");
        return true; // Workout already completed, return success
      }
      
      // Update workout with completion status with timeout
      try {
        await withTimeout(
          async () => {
            const { error } = await supabase
              .from('workouts')
              .update({
                completed_at: new Date().toISOString(),
                duration_seconds: elapsedTime
              })
              .eq('id', workoutId);
              
            if (error) throw error;
            return true;
          },
          TIMEOUT_MS
        );
      } catch (updateError) {
        console.error("Error or timeout finishing workout:", updateError);
        throw new Error("Não foi possível salvar o treino finalizado");
      }
      
      return true;
    } catch (error: any) {
      console.error("Error finishing workout:", error);
      toast.error("Erro ao finalizar treino", {
        description: error.message || "Ocorreu um erro ao salvar seu treino"
      });
      return false;
    }
  };
  
  return {
    finishWorkout
  };
};
