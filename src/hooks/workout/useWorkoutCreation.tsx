
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for creating new workouts
 */
export const useWorkoutCreation = () => {
  /**
   * Creates a new workout in the database
   */
  const createNewWorkout = async (routineId: string, userId: string) => {
    if (!routineId || !userId) {
      console.error("Missing routineId or userId in createNewWorkout");
      return null;
    }
    
    try {
      console.log("Creating new workout for routine:", routineId, "user:", userId);
      
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          routine_id: routineId,
          user_id: userId,
          started_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating new workout:", error);
        throw error;
      }
      
      console.log("Created new workout with id:", data?.id);
      return data?.id || null;
    } catch (error) {
      console.error("Error in createNewWorkout:", error);
      toast.error("Erro ao criar treino", {
        description: "Não foi possível iniciar um novo treino"
      });
      return null;
    }
  };
  
  return {
    createNewWorkout
  };
};
