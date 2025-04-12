
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for processing workout exercises
 */
export class WorkoutExerciseService {
  /**
   * Process workout exercises after workout completion
   */
  public static async processWorkoutExercises(workoutId: string): Promise<boolean> {
    try {
      if (!workoutId) {
        console.error('No workout ID provided');
        return false;
      }
      
      // Get the workout exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from('workout_sets')
        .select('exercise_id')
        .eq('workout_id', workoutId)
        .is('completed', true);
      
      if (exercisesError) {
        console.error('Error fetching workout exercises:', exercisesError);
        return false;
      }
      
      // Nothing to process
      if (!exercises || exercises.length === 0) {
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Error in processWorkoutExercises:', error);
      return false;
    }
  }
}
