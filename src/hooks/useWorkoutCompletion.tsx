
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import RPG services
import { calculateWorkoutXP, updateUserXP } from '@/services/rpg/XPService';
import { updateStreak } from '@/services/rpg/StreakService';
import { checkAchievements } from '@/services/rpg/AchievementService';
import { useAuth } from './useAuth';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile } = useAuth();

  const finishWorkout = async (elapsedTime: number) => {
    if (!workoutId) {
      toast.error("Erro ao finalizar", {
        description: "ID do treino não encontrado"
      });
      return false;
    }
    
    if (!user) {
      toast.error("Erro ao finalizar", {
        description: "Usuário não autenticado"
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Finishing workout:", workoutId, "with duration:", elapsedTime);
      
      // Check if the workout is already completed
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
      
      // Update workout with completion status
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
      
      // Increment workouts_count in profile
      try {
        await supabase
          .from('profiles')
          .update({ 
            workouts_count: profile?.workouts_count ? profile.workouts_count + 1 : 1,
          })
          .eq('id', user.id);
      } catch (countError) {
        console.error("Error updating workouts count:", countError);
        // Non-critical, continue with other operations
      }
      
      // ---- RPG MECHANICS ----
      
      // Update user streak
      const newStreak = await updateStreak(user.id);
      
      // Calculate and award XP
      const userClass = profile?.class || null;
      const workoutXPData = await calculateWorkoutXP(workoutId, userClass as any, newStreak);
      
      // Update user XP and check for level up
      const xpResult = await updateUserXP(user.id, workoutXPData.totalXP);
      
      // Check for achievements
      const newAchievements = await checkAchievements(user.id, workoutId);
      
      // Show workout completion toast with RPG data
      toast.success("Treino finalizado", {
        description: `+${workoutXPData.totalXP} XP${newStreak > 1 ? ` | Sequência: ${newStreak} dias` : ''}`,
        duration: 5000
      });
      
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
  
  return {
    finishWorkout,
    isSubmitting
  };
};
