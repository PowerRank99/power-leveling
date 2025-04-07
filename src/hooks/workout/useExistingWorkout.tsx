
import { supabase } from '@/integrations/supabase/client';

export const useExistingWorkout = () => {
  /**
   * Checks for an existing active workout for the given routine
   */
  const findExistingWorkout = async (routineId: string, userId: string) => {
    if (!routineId || !userId) {
      return null;
    }
    
    const { data: existingWorkouts, error: existingWorkoutError } = await supabase
      .from('workouts')
      .select('id')
      .eq('routine_id', routineId)
      .eq('user_id', userId)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1);
      
    if (existingWorkoutError) {
      console.error("Error checking for existing workouts:", existingWorkoutError);
    }
    
    // Return existing workout ID if available
    return existingWorkouts && existingWorkouts.length > 0 ? existingWorkouts[0].id : null;
  };

  return {
    findExistingWorkout
  };
};
