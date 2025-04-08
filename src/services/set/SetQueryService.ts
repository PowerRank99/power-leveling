
import { supabase } from '@/integrations/supabase/client';
import { SetData, DatabaseResult } from '@/types/workoutTypes';
import { toast } from 'sonner';

/**
 * Service responsible for querying workout sets
 */
export class SetQueryService {
  /**
   * Fetches all sets for a specific workout and exercise
   */
  static async getSetsForExercise(
    workoutId: string,
    exerciseId: string
  ): Promise<DatabaseResult<SetData[]>> {
    try {
      console.log(`[SetQueryService] Fetching sets for workout=${workoutId}, exercise=${exerciseId}`);
      
      const { data, error } = await supabase
        .from('workout_sets')
        .select('*')
        .eq('workout_id', workoutId)
        .eq('exercise_id', exerciseId)
        .order('set_order');
        
      if (error) {
        console.error("[SetQueryService] Error fetching sets:", error);
        return { success: false, error };
      }
      
      console.log(`[SetQueryService] Found ${data.length} sets for exercise ${exerciseId}`);
      
      // Format data to match our interface
      const formattedSets: SetData[] = data.map(set => ({
        id: set.id,
        weight: set.weight?.toString() || '0',
        reps: set.reps?.toString() || '0',
        completed: set.completed || false,
        set_order: set.set_order
      }));
      
      return { success: true, data: formattedSets };
    } catch (error) {
      console.error("[SetQueryService] Exception fetching sets:", error);
      return { success: false, error };
    }
  }

  /**
   * Counts the actual number of sets for a specific workout exercise
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
      
      console.log(`[SetQueryService] Count result: ${count} sets for exercise ${exerciseId}`);
      
      return { success: true, data: count || 0 };
    } catch (error) {
      console.error("[SetQueryService] Exception counting sets:", error);
      return { success: false, error };
    }
  }
}
