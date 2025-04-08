
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
}
