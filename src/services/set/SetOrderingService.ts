
import { supabase } from '@/integrations/supabase/client';
import { SetData, DatabaseResult } from '@/types/workoutTypes';

/**
 * Service responsible for managing the ordering of workout sets
 */
export class SetOrderingService {
  /**
   * Normalizes set orders to ensure they are sequential starting from 0
   * This is critical for consistency when adding/removing sets
   */
  static async normalizeSetOrders(
    workoutId: string,
    exerciseId: string
  ): Promise<DatabaseResult<void>> {
    try {
      console.log(`[SetOrderingService] Normalizing set orders for workout=${workoutId}, exercise=${exerciseId}`);
      
      // Get all sets for this exercise, ordered by current set_order
      const { data: sets, error: fetchError } = await supabase
        .from('workout_sets')
        .select('id, set_order')
        .eq('workout_id', workoutId)
        .eq('exercise_id', exerciseId)
        .order('set_order');
        
      if (fetchError) {
        console.error("[SetOrderingService] Error fetching sets:", fetchError);
        return { success: false, error: fetchError };
      }
      
      if (!sets || sets.length === 0) {
        console.log("[SetOrderingService] No sets to normalize");
        return { success: true };
      }
      
      console.log(`[SetOrderingService] Found ${sets.length} sets to normalize`);
      console.log(`[SetOrderingService] Current set orders: ${sets.map(s => s.set_order).join(', ')}`);
      
      // Update each set with a new sequential order
      for (let i = 0; i < sets.length; i++) {
        if (sets[i].set_order === i) {
          console.log(`[SetOrderingService] Set ${sets[i].id} already has correct order ${i}`);
          continue; // Skip if already has the correct order
        }
        
        console.log(`[SetOrderingService] Updating set ${sets[i].id} order from ${sets[i].set_order} to ${i}`);
        
        const { error: updateError } = await supabase
          .from('workout_sets')
          .update({ set_order: i })
          .eq('id', sets[i].id);
          
        if (updateError) {
          console.error(`[SetOrderingService] Error updating set ${sets[i].id} order:`, updateError);
          return { success: false, error: updateError };
        }
      }
      
      console.log("[SetOrderingService] Successfully normalized set orders");
      return { success: true };
    } catch (error) {
      console.error("[SetOrderingService] Exception normalizing set orders:", error);
      return { success: false, error };
    }
  }
}
