
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for finding existing workouts
 */
export const useExistingWorkout = () => {
  /**
   * Checks for an existing workout for the routine/user
   * Returns the workout ID or null if none exists
   */
  const findExistingWorkout = async (routineId: string, userId: string) => {
    if (!routineId || !userId) {
      console.error("Missing routineId or userId in findExistingWorkout");
      return null;
    }
    
    console.log("Checking for existing workout for routine:", routineId);
    
    const { data, error } = await supabase
      .from('workouts')
      .select('id')
      .eq('routine_id', routineId)
      .eq('user_id', userId)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error("Error finding existing workout:", error);
      return null;
    }
    
    const workoutId = data && data.length > 0 ? data[0].id : null;
    console.log("Found existing workout:", workoutId);
    
    return workoutId;
  };
  
  return {
    findExistingWorkout
  };
};
