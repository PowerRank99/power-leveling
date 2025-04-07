
import { supabase } from '@/integrations/supabase/client';

export const useWorkoutCompletion = (workoutId: string | null) => {
  const finishWorkout = async (elapsedTime: number) => {
    if (!workoutId) return false;
    
    try {
      const { error } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: elapsedTime
        })
        .eq('id', workoutId);
        
      if (error) {
        console.error("Error finishing workout:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error finishing workout:", error);
      return false;
    }
  };
  
  return {
    finishWorkout
  };
};
