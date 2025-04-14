
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExerciseData, DatabaseResult } from '@/types/workout';
import { createSuccessResult, createErrorResult } from '@/utils/serviceUtils';

/**
 * Service for handling workout-related data operations
 */
export class WorkoutDataService {
  /**
   * Fetch exercise data for the specified workout
   */
  static async getExerciseData(workoutId: string): Promise<DatabaseResult<WorkoutExerciseData[]>> {
    try {
      console.log(`[WorkoutDataService] Fetching exercise data for workout ${workoutId}`);
      
      // Join workout_sets with exercises to get the exercise data
      const { data: sets, error } = await supabase
        .from('workout_sets')
        .select(`
          id,
          exercise_id,
          weight,
          reps,
          completed,
          exercises:exercise_id (
            id,
            name,
            type
          )
        `)
        .eq('workout_id', workoutId)
        .order('set_order', { ascending: true });
        
      if (error) {
        console.error('[WorkoutDataService] Error fetching workout exercise data:', error);
        return createErrorResult(error);
      }
      
      if (!sets || sets.length === 0) {
        console.log('[WorkoutDataService] No sets found for workout');
        return createSuccessResult([]);
      }
      
      // Group sets by exercise_id
      const exerciseMap = new Map<string, WorkoutExerciseData>();
      
      sets.forEach(set => {
        const exerciseId = set.exercise_id;
        
        // Skip sets with no exercise_id
        if (!exerciseId) return;
        
        // Create or update exercise entry
        if (!exerciseMap.has(exerciseId)) {
          // Convert the exercise data to expected format - use type assertion to fix the error
          const exerciseData = set.exercises as any;
          const exerciseName = exerciseData?.name || `Exercise ${exerciseId.slice(0, 8)}`;
          const exerciseType = exerciseData?.type || undefined;
          
          exerciseMap.set(exerciseId, {
            id: set.id,
            exercise_id: exerciseId,
            name: exerciseName,
            weight: set.weight,
            reps: set.reps,
            sets: set.completed ? 1 : 0,
            type: exerciseType
          });
        } else if (set.completed) {
          const exercise = exerciseMap.get(exerciseId);
          if (exercise) {
            exercise.sets = (exercise.sets || 0) + 1;
          }
        }
      });
      
      const result = Array.from(exerciseMap.values());
      return createSuccessResult(result);
    } catch (error) {
      console.error('[WorkoutDataService] Exception fetching workout exercise data:', error);
      return createErrorResult(error);
    }
  }
}
