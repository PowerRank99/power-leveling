
import { supabase } from '@/integrations/supabase/client';
import { SetData, DatabaseResult } from '@/types/workoutTypes';
import { toast } from 'sonner';

/**
 * SetService handles all database operations related to workout sets
 * with proper transaction handling and verification.
 */
export class SetService {
  /**
   * Creates a new set in the database
   */
  static async createSet(
    workoutId: string,
    exerciseId: string,
    setOrder: number,
    weight: number,
    reps: number,
    completed: boolean = false
  ): Promise<DatabaseResult<SetData>> {
    try {
      console.log(`[SetService] Creating set: workout=${workoutId}, exercise=${exerciseId}, order=${setOrder}, weight=${weight}, reps=${reps}`);
      
      const { data, error } = await supabase
        .from('workout_sets')
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          set_order: setOrder,
          weight: weight,
          reps: reps,
          completed: completed
        })
        .select('*')
        .single();
        
      if (error) {
        console.error("[SetService] Error creating set:", error);
        return { success: false, error };
      }
      
      console.log(`[SetService] Successfully created set with ID: ${data.id}`);
      
      // Verify the newly created set
      const verificationResult = await this.verifySet(data.id);
      if (!verificationResult.success) {
        console.error("[SetService] Set verification failed after creation");
        return { success: false, error: verificationResult.error };
      }
      
      // Format to our SetData interface
      const formattedData: SetData = {
        id: data.id,
        weight: data.weight?.toString() || '0',
        reps: data.reps?.toString() || '0',
        completed: data.completed || false,
        set_order: data.set_order
      };
      
      return { success: true, data: formattedData };
    } catch (error) {
      console.error("[SetService] Exception creating set:", error);
      return { success: false, error };
    }
  }
  
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
      console.log(`[SetService] Updating set ${setId} with:`, data);
      
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
        console.error(`[SetService] Error updating set ${setId}:`, error);
        return { success: false, error };
      }
      
      console.log(`[SetService] Successfully updated set ${setId}`);
      
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
      console.error(`[SetService] Exception updating set ${setId}:`, error);
      return { success: false, error };
    }
  }
  
  /**
   * Deletes a set from the database
   */
  static async deleteSet(setId: string): Promise<DatabaseResult<void>> {
    try {
      console.log(`[SetService] Deleting set ${setId}`);
      
      const { error } = await supabase
        .from('workout_sets')
        .delete()
        .eq('id', setId);
        
      if (error) {
        console.error(`[SetService] Error deleting set ${setId}:`, error);
        return { success: false, error };
      }
      
      console.log(`[SetService] Successfully deleted set ${setId}`);
      return { success: true };
    } catch (error) {
      console.error(`[SetService] Exception deleting set ${setId}:`, error);
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
      console.log(`[SetService] Updating routine ${routineId}, exercise ${exerciseId} to ${setCount} sets`);
      
      const { error } = await supabase
        .from('routine_exercises')
        .update({ target_sets: setCount })
        .eq('routine_id', routineId)
        .eq('exercise_id', exerciseId);
      
      if (error) {
        console.error("[SetService] Error updating routine exercise set count:", error);
        return { success: false, error };
      }
      
      console.log(`[SetService] Successfully updated routine exercise target sets to ${setCount}`);
      return { success: true };
    } catch (error) {
      console.error("[SetService] Exception updating routine exercise set count:", error);
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
      console.log(`[SetService] Reordering ${sets.length} sets for workout=${workoutId}, exercise=${exerciseId}`);
      
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
          console.error(`[SetService] Error updating set ${set.id} order:`, error);
          return { success: false, error };
        }
      }
      
      console.log(`[SetService] Successfully reordered ${databaseSets.length} sets`);
      return { success: true };
    } catch (error) {
      console.error("[SetService] Exception reordering sets:", error);
      return { success: false, error };
    }
  }
  
  /**
   * Fetches all sets for a specific workout and exercise
   */
  static async getSetsForExercise(
    workoutId: string,
    exerciseId: string
  ): Promise<DatabaseResult<SetData[]>> {
    try {
      console.log(`[SetService] Fetching sets for workout=${workoutId}, exercise=${exerciseId}`);
      
      const { data, error } = await supabase
        .from('workout_sets')
        .select('*')
        .eq('workout_id', workoutId)
        .eq('exercise_id', exerciseId)
        .order('set_order');
        
      if (error) {
        console.error("[SetService] Error fetching sets:", error);
        return { success: false, error };
      }
      
      console.log(`[SetService] Found ${data.length} sets for exercise ${exerciseId}`);
      
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
      console.error("[SetService] Exception fetching sets:", error);
      return { success: false, error };
    }
  }
  
  /**
   * Verifies that a set exists in the database
   */
  static async verifySet(setId: string): Promise<DatabaseResult<boolean>> {
    try {
      const { data, error } = await supabase
        .from('workout_sets')
        .select('id')
        .eq('id', setId)
        .single();
        
      if (error) {
        console.error(`[SetService] Set verification failed for ID ${setId}:`, error);
        return { success: false, error };
      }
      
      return { success: true, data: true };
    } catch (error) {
      console.error(`[SetService] Exception verifying set ${setId}:`, error);
      return { success: false, error };
    }
  }
  
  /**
   * Handles error display to the user
   */
  static displayError(operation: string, error: any): void {
    console.error(`[SetService] Error during ${operation}:`, error);
    
    toast.error(`Erro ao ${operation}`, {
      description: "Ocorreu um problema. Tente novamente."
    });
  }
}
