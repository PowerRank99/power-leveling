
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResult, SetData } from '@/types/workoutTypes';

/**
 * Service responsible for querying workout sets
 */
export class SetQueryService {
  /**
   * Get all sets for a specific exercise in a workout
   */
  static async getSetsForExercise(
    workoutId: string,
    exerciseId: string
  ): Promise<DatabaseResult<SetData[]>> {
    try {
      console.log(`[SetQueryService] Getting sets for workout=${workoutId}, exercise=${exerciseId}`);
      
      const { data, error } = await supabase
        .from('workout_sets')
        .select(`
          id,
          weight,
          reps,
          completed,
          set_order
        `)
        .eq('workout_id', workoutId)
        .eq('exercise_id', exerciseId)
        .order('set_order');
        
      if (error) {
        console.error("[SetQueryService] Error fetching sets:", error);
        return { success: false, error };
      }
      
      // Format results to match our SetData interface
      const formattedSets: SetData[] = data.map(set => ({
        id: set.id,
        weight: set.weight?.toString() || '0',
        reps: set.reps?.toString() || '0',
        completed: set.completed || false,
        set_order: set.set_order
      }));
      
      console.log(`[SetQueryService] Found ${formattedSets.length} sets`);
      
      return { success: true, data: formattedSets };
    } catch (error) {
      console.error("[SetQueryService] Exception fetching sets:", error);
      return { success: false, error };
    }
  }
  
  /**
   * Count the number of sets for an exercise in a workout
   */
  static async countSetsForExercise(
    workoutId: string,
    exerciseId: string
  ): Promise<DatabaseResult<number>> {
    try {
      console.log(`[SetQueryService] Counting sets for workout=${workoutId}, exercise=${exerciseId}`);
      
      const { count, error } = await supabase
        .from('workout_sets')
        .select('*', { count: 'exact', head: true })
        .eq('workout_id', workoutId)
        .eq('exercise_id', exerciseId);
        
      if (error) {
        console.error("[SetQueryService] Error counting sets:", error);
        return { success: false, error };
      }
      
      console.log(`[SetQueryService] Count result: ${count}`);
      
      return { success: true, data: count || 0 };
    } catch (error) {
      console.error("[SetQueryService] Exception counting sets:", error);
      return { success: false, error };
    }
  }
}
