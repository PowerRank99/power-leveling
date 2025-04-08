
import { supabase } from '@/integrations/supabase/client';

/**
 * Service responsible for fetching previous workout data
 */
export class PreviousWorkoutService {
  /**
   * Fetches previous workout data for a specific routine
   */
  static async fetchPreviousWorkoutData(routineId: string, currentWorkoutId: string) {
    try {
      console.log("Looking for previous workouts with routine ID:", routineId);
      
      // Get most recent completed workout for this routine (excluding current one)
      const { data: previousWorkout } = await supabase
        .from('workouts')
        .select('id')
        .eq('routine_id', routineId)
        .not('id', 'eq', currentWorkoutId) 
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1);
      
      if (!previousWorkout || previousWorkout.length === 0) {
        console.log("No previous completed workouts found for this routine");
        return {};
      }
      
      console.log("Found previous workout for reference:", previousWorkout[0].id);
      
      // Get all completed sets from the previous workout
      const { data: previousSets, error } = await supabase
        .from('workout_sets')
        .select('exercise_id, weight, reps, set_order')
        .eq('workout_id', previousWorkout[0].id)
        .order('set_order');
      
      if (error) {
        console.error("Error fetching previous sets:", error);
        return {};
      }
      
      if (!previousSets || previousSets.length === 0) {
        console.log("No sets found in previous workout");
        return {};
      }
      
      console.log(`Found ${previousSets.length} sets from previous workout`);
      
      // Group by exercise ID
      const previousWorkoutData = previousSets.reduce((acc: Record<string, any[]>, curr) => {
        if (!curr.exercise_id) return acc;
        if (!acc[curr.exercise_id]) acc[curr.exercise_id] = [];
        
        // Ensure values are always strings for UI consistency
        const weightStr = curr.weight !== null && curr.weight !== undefined ? curr.weight.toString() : '0';
        const repsStr = curr.reps !== null && curr.reps !== undefined ? curr.reps.toString() : '12';
        
        acc[curr.exercise_id].push({
          weight: weightStr,
          reps: repsStr,
          set_order: curr.set_order
        });
        return acc;
      }, {});
      
      // Sort sets by set_order for each exercise
      Object.keys(previousWorkoutData).forEach(exerciseId => {
        previousWorkoutData[exerciseId].sort((a, b) => a.set_order - b.set_order);
      });
      
      console.log("Previous workout data loaded:", Object.keys(previousWorkoutData).length, "exercises");
      
      return previousWorkoutData;
    } catch (error) {
      console.error("Error fetching previous workout data:", error);
      return {};
    }
  }
}
