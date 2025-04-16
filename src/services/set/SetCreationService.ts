
import { supabase } from '@/integrations/supabase/client';
import { SetData, DatabaseResult } from '@/types/workoutTypes';
import { toast } from 'sonner';

/**
 * Service responsible for creating workout sets
 */
export class SetCreationService {
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
      console.log(`[SetCreationService] Creating set: workout=${workoutId}, exercise=${exerciseId}, order=${setOrder}, weight=${weight}, reps=${reps}`);
      
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
        console.error("[SetCreationService] Error creating set:", error);
        return { success: false, error };
      }
      
      console.log(`[SetCreationService] Successfully created set with ID: ${data.id}`);
      
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
      console.error("[SetCreationService] Exception creating set:", error);
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
        console.error(`[SetCreationService] Set verification failed for ID ${setId}:`, error);
        return { success: false, error };
      }
      
      return { success: true, data: true };
    } catch (error) {
      console.error(`[SetCreationService] Exception verifying set ${setId}:`, error);
      return { success: false, error };
    }
  }
}
