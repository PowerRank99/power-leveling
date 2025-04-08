
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResult, SetData } from '@/types/workoutTypes';
import { toast } from 'sonner';

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
      
      // Get all remaining sets for this exercise that have a higher order
      const { data: higherSets, error: higherSetsError } = await supabase
        .from('workout_sets')
        .select('id, set_order')
        .eq('workout_id', workout_id)
        .eq('exercise_id', exercise_id)
        .gt('set_order', set_order)
        .order('set_order');
        
      if (higherSetsError) {
        console.error(`[SetDeleteService] Error fetching higher ordered sets:`, higherSetsError);
        return { success: false, error: higherSetsError };
      }
      
      // Decrement the order of all higher sets to fill the gap
      if (higherSets && higherSets.length > 0) {
        console.log(`[SetDeleteService] Reordering ${higherSets.length} sets after deletion`);
        
        for (const set of higherSets) {
          const newOrder = set.set_order - 1;
          console.log(`[SetDeleteService] Updating set ${set.id} order from ${set.set_order} to ${newOrder}`);
          
          const { error: updateError } = await supabase
            .from('workout_sets')
            .update({ set_order: newOrder })
            .eq('id', set.id);
            
          if (updateError) {
            console.error(`[SetDeleteService] Error updating set ${set.id} order:`, updateError);
            continue; // Continue with other updates even if one fails
          }
        }
      }
      
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
      
      console.log(`[SetDeleteService] Found ${currentSets.length} sets in database, reordering to ${databaseSets.length} sets`);
      
      // For each set in the database, update its order based on position in our array
      // This ensures all sets have sequential order values starting from 0
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
}
