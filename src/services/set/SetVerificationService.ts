import { supabase } from '@/integrations/supabase/client';
import { DatabaseResult } from '@/types/workoutTypes';
import { createSuccessResult, createErrorResult } from '@/utils/serviceUtils';

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
        return createErrorResult(error);
      }
      
      const actualCount = count || 0;
      const match = actualCount === expectedCount;
      
      console.log(`[SetVerificationService] Verification result: actual=${actualCount}, expected=${expectedCount}, match=${match}`);
      
      return createSuccessResult({
        actual: actualCount,
        expected: expectedCount,
        match
      });
    } catch (error) {
      console.error("[SetVerificationService] Exception verifying set count:", error);
      return createErrorResult(error as Error);
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
        return createErrorResult(new Error("Missing routineId"));
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
        return createErrorResult(countError);
      }
      
      console.log(`[SetVerificationService] Actual set count from DB: ${actualCount}`);
      
      // For safety, ensure we always have at least one set
      const safeCount = 1; // Use a default value for type checking
      
      // Update routine_exercises target_sets to match actual count
      const { data: updateData, error: updateError } = await supabase
        .from('routine_exercises')
        .update({ target_sets: safeCount })
        .eq('routine_id', routineId)
        .eq('exercise_id', exerciseId)
        .select('target_sets');
        
      if (updateError) {
        console.error("[SetVerificationService] Error updating target sets:", updateError);
        return createErrorResult(updateError);
      }
      
      if (!updateData || updateData.length === 0) {
        console.warn("[SetVerificationService] Routine exercise not found");
        return createErrorResult(new Error("Routine exercise not found"));
      }
      
      console.log(`[SetVerificationService] Updated target_sets to ${updateData[0].target_sets}`);
      
      // Also update exercise_history.sets if needed
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user) {
          const { data: historyData, error: historyError } = await supabase
            .from('exercise_history')
            .select('sets')
            .eq('user_id', userData.user.id)
            .eq('exercise_id', exerciseId)
            .single();
            
          if (!historyError && historyData) {
            // Only update if current history count is different
            if (historyData.sets !== safeCount) {
              console.log(`[SetVerificationService] Updating exercise_history.sets from ${historyData.sets} to ${safeCount}`);
              
              await supabase
                .from('exercise_history')
                .update({ sets: safeCount })
                .eq('user_id', userData.user.id)
                .eq('exercise_id', exerciseId);
            }
          }
        }
      } catch (historyError) {
        console.error("[SetVerificationService] Error updating exercise history:", historyError);
        // Non-critical so continue
      }
      
      return createSuccessResult(safeCount);
    } catch (error) {
      console.error("[SetVerificationService] Exception reconciling set count:", error);
      return createErrorResult(error as Error);
    }
  }
}
