
import { supabase } from '@/integrations/supabase/client';

/**
 * Service responsible for fetching previous workout data
 */
export class PreviousWorkoutService {
  /**
   * Fetches previous workout data for a routine
   */
  static async fetchPreviousWorkoutData(routineId: string, currentWorkoutId?: string) {
    try {
      console.log("[PreviousWorkoutService] Fetching previous workout data for routine:", routineId);
      
      // Build query to get most recent completed workout for this routine
      let query = supabase
        .from('workouts')
        .select('id')
        .eq('routine_id', routineId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1);
        
      // If we have a current workout ID, exclude it
      if (currentWorkoutId) {
        query = query.neq('id', currentWorkoutId);
      }
      
      const { data: previousWorkout } = await query;
      
      // No previous workout found
      if (!previousWorkout || previousWorkout.length === 0) {
        console.log("[PreviousWorkoutService] No previous workout found for this routine");
        return {};
      }
      
      const previousWorkoutId = previousWorkout[0].id;
      console.log("[PreviousWorkoutService] Found previous workout:", previousWorkoutId);
      
      // Get all sets from the previous workout
      const { data: previousSets, error } = await supabase
        .from('workout_sets')
        .select('exercise_id, weight, reps, set_order')
        .eq('workout_id', previousWorkoutId)
        .order('set_order');
      
      if (error) {
        console.error("[PreviousWorkoutService] Error fetching previous sets:", error);
        return {};
      }
      
      // Group sets by exercise
      const previousWorkoutData = previousSets?.reduce((acc: Record<string, any[]>, set) => {
        if (!set.exercise_id) return acc;
        if (!acc[set.exercise_id]) acc[set.exercise_id] = [];
        
        acc[set.exercise_id].push({
          weight: set.weight?.toString() || '0',
          reps: set.reps?.toString() || '0',
          set_order: set.set_order
        });
        
        return acc;
      }, {}) || {};
      
      // Sort sets by set_order
      Object.keys(previousWorkoutData).forEach(exerciseId => {
        previousWorkoutData[exerciseId].sort((a: any, b: any) => a.set_order - b.set_order);
      });
      
      console.log("[PreviousWorkoutService] Loaded previous data for", Object.keys(previousWorkoutData).length, "exercises");
      return previousWorkoutData;
    } catch (error) {
      console.error("[PreviousWorkoutService] Error fetching previous workout data:", error);
      return {};
    }
  }
}
