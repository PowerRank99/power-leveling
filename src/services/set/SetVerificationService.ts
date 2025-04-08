
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResult } from '@/types/workoutTypes';
import { toast } from 'sonner';

/**
 * Service responsible for verifying and reconciling set counts
 */
export class SetVerificationService {
  /**
   * Verifies the actual number of sets for an exercise in a workout
   * and compares it with the expected count
   */
  static async verifySetCount(
    workoutId: string,
    exerciseId: string,
    expectedCount: number
  ): Promise<DatabaseResult<{actual: number, expected: number, match: boolean}>> {
    try {
      console.log(`[SetVerificationService] Verifying set count for workout=${workoutId}, exercise=${exerciseId}, expected=${expectedCount}`);
      
      // Count actual sets in workout_sets
      const { count, error } = await supabase
        .from('workout_sets')
        .select('*', { count: 'exact', head: true })
        .eq('workout_id', workoutId)
        .eq('exercise_id', exerciseId);
        
      if (error) {
        console.error("[SetVerificationService] Error counting sets:", error);
        return { success: false, error };
      }
      
      const actualCount = count || 0;
      const match = actualCount === expectedCount;
      
      console.log(`[SetVerificationService] Verification result: actual=${actualCount}, expected=${expectedCount}, match=${match}`);
      
      return { 
        success: true, 
        data: {
          actual: actualCount,
          expected: expectedCount,
          match
        }
      };
    } catch (error) {
      console.error("[SetVerificationService] Exception verifying set count:", error);
      return { success: false, error };
    }
  }
  
  /**
   * Reconciles any discrepancies between the actual set count in workout_sets
   * and the target_sets in routine_exercises
   */
  static async reconcileSetCount(
    workoutId: string,
    exerciseId: string,
    routineId: string | null
  ): Promise<DatabaseResult<number>> {
    try {
      if (!routineId) {
        console.warn("[SetVerificationService] No routineId provided, cannot reconcile");
        return { success: false, error: new Error("Missing routineId") };
      }
      
      console.log(`[SetVerificationService] Reconciling set count for workout=${workoutId}, exercise=${exerciseId}, routine=${routineId}`);
      
      // Get actual count from workout_sets (source of truth)
      const { count: actualCount, error: countError } = await supabase
        .from('workout_sets')
        .select('*', { count: 'exact', head: true })
        .eq('workout_id', workoutId)
        .eq('exercise_id', exerciseId);
        
      if (countError) {
        console.error("[SetVerificationService] Error counting sets:", countError);
        return { success: false, error: countError };
      }
      
      console.log(`[SetVerificationService] Actual set count from DB: ${actualCount}`);
      
      if (actualCount === 0) {
        console.warn("[SetVerificationService] No sets found, should have at least one set");
        return { success: false, error: new Error("No sets found") };
      }
      
      // Update routine_exercises target_sets to match actual count
      const { data: updateData, error: updateError } = await supabase
        .from('routine_exercises')
        .update({ target_sets: actualCount })
        .eq('routine_id', routineId)
        .eq('exercise_id', exerciseId)
        .select('target_sets');
        
      if (updateError) {
        console.error("[SetVerificationService] Error updating target sets:", updateError);
        return { success: false, error: updateError };
      }
      
      if (!updateData || updateData.length === 0) {
        console.warn("[SetVerificationService] Routine exercise not found");
        return { success: false, error: new Error("Routine exercise not found") };
      }
      
      console.log(`[SetVerificationService] Updated target_sets to ${updateData[0].target_sets}`);
      
      return { success: true, data: actualCount };
    } catch (error) {
      console.error("[SetVerificationService] Exception reconciling set count:", error);
      return { success: false, error };
    }
  }
}
