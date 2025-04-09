
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { XPService } from '@/services/rpg/XPService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { StreakService } from '@/services/rpg/StreakService';

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
      
      // Get workout data to check user_id
      const { data: workoutData, error: fetchError } = await supabase
        .from('workouts')
        .select('user_id')
        .eq('id', workoutId)
        .single();
        
      if (fetchError || !workoutData) {
        console.error("Error fetching workout data:", fetchError);
        throw new Error("Não foi possível localizar os dados do treino");
      }
      
      const userId = workoutData.user_id;
      if (!userId) {
        console.error("No user ID associated with workout");
        throw new Error("Treino sem usuário associado");
      }
      
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
      
      // RPG System integration
      try {
        // Step 1: Update user streak
        await StreakService.updateStreak(userId);
        
        // Step 2: Calculate and award XP
        const baseXP = 50; // Base XP for completing a workout
        await XPService.awardXP(userId, baseXP);
        
        // Step 3: Check for achievements
        await AchievementService.checkAchievements(userId);
      } catch (rpgError) {
        // Log but don't fail the workout completion
        console.error("Error processing RPG rewards:", rpgError);
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
