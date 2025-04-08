
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkoutCompletion } from '../useWorkoutCompletion';

export const useWorkoutActions = (workoutId: string | null) => {
  const { finishWorkout: finishWorkoutAction } = useWorkoutCompletion(workoutId);
  
  const finishWorkout = async (elapsedTime: number, restTimerSettings: { minutes: number, seconds: number }) => {
    try {
      if (workoutId) {
        await supabase
          .from('workouts')
          .update({
            rest_timer_minutes: restTimerSettings.minutes,
            rest_timer_seconds: restTimerSettings.seconds
          } as any) // Use type assertion to bypass TypeScript error
          .eq('id', workoutId);
      }
      
      const success = await finishWorkoutAction(elapsedTime);
      if (success) {
        toast.success("Treino finalizado!", {
          description: "Seu treino foi salvo com sucesso."
        });
      }
      return success;
    } catch (error) {
      console.error("Error finishing workout:", error);
      return false;
    }
  };

  const discardWorkout = async () => {
    if (!workoutId) {
      toast.error("Erro ao descartar treino", {
        description: "ID do treino não encontrado"
      });
      return false;
    }
    
    try {
      console.log("Discarding workout:", workoutId);
      
      const { error: setsError } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_id', workoutId);
        
      if (setsError) {
        console.error("Error deleting workout sets:", setsError);
        throw new Error("Erro ao excluir séries do treino");
      }
      
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (workoutError) {
        console.error("Error deleting workout:", workoutError);
        throw new Error("Erro ao excluir treino");
      }
      
      return true;
    } catch (error) {
      console.error("Error discarding workout:", error);
      throw error;
    }
  };
  
  return {
    finishWorkout,
    discardWorkout
  };
};
