
import { supabase } from '@/integrations/supabase/client';
import { SetData, DatabaseResult } from '@/types/workoutTypes';
import { toast } from 'sonner';

/**
 * Service responsible for updating workout sets
 */
export class SetUpdateService {
  /**
   * Updates an existing set in the database
   */
  static async updateSet(
    setId: string,
    data: {
      weight?: number;
      reps?: number;
      completed?: boolean;
    }
  ): Promise<DatabaseResult<SetData>> {
    try {
      console.log(`[SetUpdateService] Updating set ${setId} with:`, data);
      
      // Prepare the update data including completed_at timestamp
      const updateData: any = { ...data };
      if ('completed' in data) {
        updateData.completed_at = data.completed ? new Date().toISOString() : null;
      }
      
      const { data: updatedSet, error } = await supabase
        .from('workout_sets')
        .update(updateData)
        .eq('id', setId)
        .select('*')
        .single();
        
      if (error) {
        console.error(`[SetUpdateService] Error updating set ${setId}:`, error);
        return { success: false, error };
      }
      
      console.log(`[SetUpdateService] Successfully updated set ${setId}`);
      
      // Format to our SetData interface
      const formattedData: SetData = {
        id: updatedSet.id,
        weight: updatedSet.weight?.toString() || '0',
        reps: updatedSet.reps?.toString() || '0',
        completed: updatedSet.completed || false,
        set_order: updatedSet.set_order
      };
      
      return { success: true, data: formattedData };
    } catch (error) {
      console.error(`[SetUpdateService] Exception updating set ${setId}:`, error);
      return { success: false, error };
    }
  }
  
  /**
   * Updates the target sets count for a routine exercise
   */
  static async updateRoutineExerciseSetsCount(
    routineId: string, 
    exerciseId: string, 
    setCount: number
  ): Promise<DatabaseResult<void>> {
    try {
      console.log(`[SetUpdateService] Updating routine ${routineId}, exercise ${exerciseId} to ${setCount} sets`);
      
      if (!routineId) {
        console.warn("[SetUpdateService] Missing routineId for updating target sets count");
        return { success: false, error: new Error("Missing routineId") };
      }
      
      const { data, error } = await supabase
        .from('routine_exercises')
        .update({ target_sets: setCount })
        .eq('routine_id', routineId)
        .eq('exercise_id', exerciseId)
        .select();
      
      if (error) {
        console.error("[SetUpdateService] Error updating routine exercise set count:", error);
        return { success: false, error };
      }
      
      console.log(`[SetUpdateService] Successfully updated routine exercise target sets to ${setCount}:`, data);
      return { success: true };
    } catch (error) {
      console.error("[SetUpdateService] Exception updating routine exercise set count:", error);
      return { success: false, error };
    }
  }
}
