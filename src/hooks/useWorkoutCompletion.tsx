
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      
      // Check if the workout is already completed
      const { data: workoutData, error: checkError } = await supabase
        .from('workouts')
        .select('completed_at')
        .eq('id', workoutId)
        .single();
      
      if (checkError) {
        console.error("Error checking workout status:", checkError);
        throw new Error("Não foi possível verificar o estado do treino");
      }
      
      if (workoutData?.completed_at) {
        console.log("Workout already completed, skipping update");
        return true; // Workout already completed, return success
      }
      
      const { error } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: elapsedTime
        })
        .eq('id', workoutId);
        
      if (error) {
        console.error("Error finishing workout:", error);
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
