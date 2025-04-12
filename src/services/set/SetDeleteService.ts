import { supabase } from '@/integrations/supabase/client';
import { DatabaseResult, SetData } from '@/types/workoutTypes';

/**
 * Service responsible for deleting and reordering workout sets
 */
export class SetDeleteService {
  /**
   * Deletes a set from the database
   */
  static async deleteSet(setId: string): Promise<DatabaseResult<void>> {
    try {
      console.log(`[SetDeleteService] Deleting set ${setId}`);
      
      // First, get information about the set to be deleted 
      const { data: setData, error: fetchError } = await supabase
        .from('workout_sets')
        .select('workout_id, exercise_id, set_order')
        .eq('id', setId)
        .single();
      
      if (fetchError) {
        console.error(`[SetDeleteService] Error fetching set ${setId} for deletion:`, fetchError);
        return { success: false, error: fetchError };
      }
      
      if (!setData) {
        console.error(`[SetDeleteService] Set ${setId} not found for deletion`);
        return { success: false, error: new Error(`Set ${setId} not found`) };
      }
      
      const { workout_id, exercise_id, set_order } = setData;
      console.log(`[SetDeleteService] Found set to delete: workout=${workout_id}, exercise=${exercise_id}, order=${set_order}`);
      
      // Delete the set
      const { error } = await supabase
        .from('workout_sets')
        .delete()
        .eq('id', setId);
        
      if (error) {
        console.error(`[SetDeleteService] Error deleting set ${setId}:`, error);
        return { success: false, error };
      }
      
      console.log(`[SetDeleteService] Successfully deleted set ${setId}`);
      
      // After deletion, normalize the set orders to ensure they remain sequential
      await this.normalizeSetOrders(workout_id, exercise_id);
      
      return { success: true };
    } catch (error) {
      console.error(`[SetDeleteService] Exception deleting set ${setId}:`, error);
      return { success: false, error };
    }
  }

  /**
   * Reorders sets after deletion or other operations
   * to ensure they remain sequential
   */
  static async reorderSets(
    workoutId: string,
    exerciseId: string,
    sets: SetData[]
  ): Promise<DatabaseResult<void>> {
    try {
      console.log(`[SetDeleteService] Reordering ${sets.length} sets for workout=${workoutId}, exercise=${exerciseId}`);
      
      // Only proceed with sets that have database IDs
      const databaseSets = sets.filter(set => 
        !set.id.startsWith('default-') && !set.id.startsWith('new-')
      );
      
      if (databaseSets.length === 0) {
        console.log(`[SetDeleteService] No database sets to reorder`);
        return { success: true };
      }
      
      // Get current sets from the database to ensure we're working with latest data
      const { data: currentSets, error: fetchError } = await supabase
        .from('workout_sets')
        .select('id, set_order')
        .eq('workout_id', workoutId)
        .eq('exercise_id', exerciseId)
        .order('set_order');
        
      if (fetchError) {
        console.error(`[SetDeleteService] Error fetching current sets for reordering:`, fetchError);
        return { success: false, error: fetchError };
      }
      
      // If no sets found in DB, nothing to reorder
      if (!currentSets || currentSets.length === 0) {
        console.log(`[SetDeleteService] No sets found in database to reorder`);
        return { success: true };
      }
      
      console.log(`[SetDeleteService] Found ${currentSets.length} sets in database for reordering`);
      
      // For each set in the database, update its order based on position in array
      for (let i = 0; i < currentSets.length; i++) {
        const set = currentSets[i];
        const newOrder = i;
        
        if (set.set_order === newOrder) {
          console.log(`[SetDeleteService] Set ${set.id} already has correct order ${newOrder}`);
          continue; // Skip if already has correct order
        }
        
        console.log(`[SetDeleteService] Updating set ${set.id} order from ${set.set_order} to ${newOrder}`);
        
        const { error } = await supabase
          .from('workout_sets')
          .update({ set_order: newOrder })
          .eq('id', set.id);
          
        if (error) {
          console.error(`[SetDeleteService] Error updating set ${set.id} order:`, error);
          // Continue with other updates even if one fails
        }
      }
      
      console.log(`[SetDeleteService] Successfully reordered ${currentSets.length} sets`);
      return { success: true };
    } catch (error) {
      console.error("[SetDeleteService] Exception reordering sets:", error);
      return { success: false, error };
    }
  }
  
  /**
   * Normalizes set orders to ensure they are sequential
   * This is automatically called after deletion
   */
  static async normalizeSetOrders(
    workoutId: string,
    exerciseId: string
  ): Promise<DatabaseResult<void>> {
    try {
      console.log(`[SetDeleteService] Normalizing set orders after deletion for workout=${workoutId}, exercise=${exerciseId}`);
      
      // Get all remaining sets for this exercise, ordered by current set_order
      const { data: sets, error: fetchError } = await supabase
        .from('workout_sets')
        .select('id, set_order')
        .eq('workout_id', workoutId)
        .eq('exercise_id', exerciseId)
        .order('set_order');
        
      if (fetchError) {
        console.error("[SetDeleteService] Error fetching sets for normalization:", fetchError);
        return { success: false, error: fetchError };
      }
      
      if (!sets || sets.length === 0) {
        console.log("[SetDeleteService] No sets to normalize after deletion");
        return { success: true };
      }
      
      console.log(`[SetDeleteService] Found ${sets.length} sets to normalize after deletion`);
      console.log(`[SetDeleteService] Current set orders: ${sets.map(s => s.set_order).join(', ')}`);
      
      // Update each set with a new sequential order
      for (let i = 0; i < sets.length; i++) {
        if (sets[i].set_order === i) {
          console.log(`[SetDeleteService] Set ${sets[i].id} already has correct order ${i}`);
          continue; // Skip if already has the correct order
        }
        
        console.log(`[SetDeleteService] Updating set ${sets[i].id} order from ${sets[i].set_order} to ${i}`);
        
        const { error: updateError } = await supabase
          .from('workout_sets')
          .update({ set_order: i })
          .eq('id', sets[i].id);
          
        if (updateError) {
          console.error(`[SetDeleteService] Error updating set ${sets[i].id} order:`, updateError);
          // Continue with other updates even if one fails
        }
      }
      
      console.log("[SetDeleteService] Successfully normalized set orders after deletion");
      return { success: true };
    } catch (error) {
      console.error("[SetDeleteService] Exception normalizing set orders:", error);
      return { success: false, error };
    }
  }
}
