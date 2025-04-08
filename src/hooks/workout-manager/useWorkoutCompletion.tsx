
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useWorkoutCompletion = (
  workoutId: string | null,
  elapsedTime: number,
  navigate: ReturnType<typeof useNavigate>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finishWorkout = async () => {
    if (!workoutId) {
      toast.error("Erro ao finalizar", {
        description: "ID do treino não encontrado"
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Finishing workout:", workoutId, "with duration:", elapsedTime);
      
      // Update workout with completion status
      const { error } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: elapsedTime
        })
        .eq('id', workoutId);
        
      if (error) {
        throw error;
      }
      
      // Toast notification
      toast.success("Treino finalizado", {
        description: "Seu treino foi salvo com sucesso!"
      });
      
      // Redirect to workout page after a delay
      setTimeout(() => {
        navigate('/treino');
      }, 1500);
      
      return true;
    } catch (error: any) {
      console.error("Error finishing workout:", error);
      toast.error("Erro ao finalizar treino", {
        description: error.message || "Ocorreu um erro ao salvar seu treino"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const discardWorkout = async () => {
    if (!workoutId) {
      toast.error("Erro ao descartar", {
        description: "ID do treino não encontrado"
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Discarding workout:", workoutId);
      
      // Delete workout
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (error) {
        throw error;
      }
      
      toast.info("Treino descartado");
      
      // Redirect to workout page
      navigate('/treino');
      
      return true;
    } catch (error: any) {
      console.error("Error discarding workout:", error);
      toast.error("Erro ao descartar treino", {
        description: error.message || "Ocorreu um erro ao descartar seu treino"
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
