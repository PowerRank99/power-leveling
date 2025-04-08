
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
      
      const { error } = await supabase
        .from('workout_sets')
        .delete()
        .eq('id', setId);
        
      if (error) {
        console.error(`[SetDeleteService] Error deleting set ${setId}:`, error);
        return { success: false, error };
      }
      
      console.log(`[SetDeleteService] Successfully deleted set ${setId}`);
      return { success: true };
    } catch (error) {
      console.error(`[SetDeleteService] Exception deleting set ${setId}:`, error);
      return { success: false, error };
    }
  }

  /**
   * Reorders set indices after deletion
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
      
      // For each set that exists in the database, update its order
      for (let i = 0; i < databaseSets.length; i++) {
        const set = databaseSets[i];
        const { error } = await supabase
          .from('workout_sets')
          .update({ set_order: i })
          .eq('id', set.id);
          
        if (error) {
          console.error(`[SetDeleteService] Error updating set ${set.id} order:`, error);
          return { success: false, error };
        }
      }
      
      console.log(`[SetDeleteService] Successfully reordered ${databaseSets.length} sets`);
      return { success: true };
    } catch (error) {
      console.error("[SetDeleteService] Exception reordering sets:", error);
      return { success: false, error };
    }
  }
}
