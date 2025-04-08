
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TIMEOUT_MS = 10000; // 10 seconds timeout for operations

// Custom timeout promise
const withTimeout = (promise: Promise<any>, ms: number) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), ms)
    )
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
        const response = await withTimeout(
          supabase
            .from('workouts')
            .select('completed_at')
            .eq('id', workoutId)
            .single(),
          TIMEOUT_MS
        );
        
        workoutData = response.data;
        
        if (response.error) {
          throw new Error("Não foi possível verificar o estado do treino");
        }
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
        const response = await withTimeout(
          supabase
            .from('workouts')
            .update({
              completed_at: new Date().toISOString(),
              duration_seconds: elapsedTime
            })
            .eq('id', workoutId),
          TIMEOUT_MS
        );
        
        if (response.error) {
          throw new Error("Não foi possível salvar o treino finalizado");
        }
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
