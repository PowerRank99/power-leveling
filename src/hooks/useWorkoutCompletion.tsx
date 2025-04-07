
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
      
      const { error } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: elapsedTime
        })
        .eq('id', workoutId);
        
      if (error) {
        console.error("Error finishing workout:", error);
        toast.error("Erro ao finalizar treino", {
          description: "Não foi possível salvar o treino finalizado"
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error finishing workout:", error);
      toast.error("Erro ao finalizar treino", {
        description: "Ocorreu um erro ao salvar seu treino"
      });
      return false;
    }
  };
  
  return {
    finishWorkout
  };
};
