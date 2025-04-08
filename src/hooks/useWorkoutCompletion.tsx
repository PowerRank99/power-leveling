
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const useWorkoutCompletion = (workoutId: string | null) => {
  const finishWorkout = async (elapsedTime: number) => {
    console.log("Starting finishWorkout with workoutId:", workoutId, "and elapsedTime:", elapsedTime);
    
    if (!workoutId) {
      console.log("No workoutId provided, returning error");
      toast.error("Erro ao finalizar", {
        description: "ID do treino não encontrado"
      });
      return { success: false, error: "ID do treino não encontrado" };
    }
    
    try {
      console.log("Checking if workout", workoutId, "is already completed");
      
      // Check if the workout is already completed
      let workoutData;
      try {
        console.log("Fetching workout completion status...");
        workoutData = await withTimeout(
          async () => {
            const { data, error } = await supabase
              .from('workouts')
              .select('completed_at')
              .eq('id', workoutId)
              .single();
              
            if (error) {
              console.error("Error checking workout status:", error);
              throw error;
            }
            console.log("Workout status retrieved:", data);
            return data;
          },
          TIMEOUT_MS
        );
        console.log("Successfully checked workout completion status:", workoutData);
      } catch (checkError) {
        console.error("Error or timeout checking workout status:", checkError);
        throw new Error("Não foi possível verificar o estado do treino");
      }
      
      if (workoutData?.completed_at) {
        console.log("Workout already completed, skipping update");
        return { success: true, error: null }; // Workout already completed, return success
      }
      
      // Update workout with completion status
      try {
        console.log("Updating workout completion status...");
        await withTimeout(
          async () => {
            const { error } = await supabase
              .from('workouts')
              .update({
                completed_at: new Date().toISOString(),
                duration_seconds: elapsedTime
              })
              .eq('id', workoutId);
              
            if (error) {
              console.error("Error updating workout completion:", error);
              throw error;
            }
            console.log("Workout completion updated successfully");
            return true;
          },
          TIMEOUT_MS
        );
        
        console.log("Workout", workoutId, "finished successfully");
        return { success: true, error: null };
      } catch (updateError) {
        console.error("Error or timeout finishing workout:", updateError);
        throw new Error("Não foi possível salvar o treino finalizado");
      }
    } catch (error: any) {
      console.error("Error finishing workout:", error);
      return { success: false, error: error.message || "Unknown error" };
    }
  };
  
  return {
    finishWorkout
  };
};
