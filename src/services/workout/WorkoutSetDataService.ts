
import { supabase } from '@/integrations/supabase/client';

/**
 * Service responsible for fetching workout set data from the database
 */
export class WorkoutSetDataService {
  /**
   * Fetches all workout sets for a specific workout
   */
  static async fetchWorkoutSets(workoutId: string) {
    console.log("Fetching workout sets for workout:", workoutId);
    
    const { data: workoutSets, error: fetchSetsError } = await supabase
      .from('workout_sets')
      .select(`
        id,
        exercise_id,
        set_order,
        weight,
        reps,
        completed
      `)
      .eq('workout_id', workoutId)
      .order('set_order');
      
    if (fetchSetsError) {
      console.error("Error fetching workout sets:", fetchSetsError);
      throw fetchSetsError;
    }
    
    console.log(`Found ${workoutSets?.length || 0} sets for this workout`);
    return workoutSets || [];
  }
  
  /**
   * Fetches routine ID for a workout
   */
  static async fetchWorkoutRoutineId(workoutId: string) {
    const { data: routineData, error } = await supabase
      .from('workouts')
      .select('routine_id')
      .eq('id', workoutId)
      .single();
      
    if (error) {
      console.error("Error fetching routine data:", error);
      return null;
    }
    
    return routineData?.routine_id || null;
  }
}
