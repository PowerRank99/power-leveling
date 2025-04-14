
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResult } from '@/types/workout';
import { createSuccessResult, createErrorResult } from '@/utils/serviceUtils';

/**
 * Service for updating exercise history data
 */
export class ExerciseHistoryUpdateService {
  /**
   * Update exercise history based on workout data
   */
  static async updateExerciseHistory(
    exerciseId: string,
    weight: number,
    reps: number,
    sets: number
  ): Promise<DatabaseResult<boolean>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('No authenticated user found');
      }
      
      const userId = userData.user.id;
      
      // First, check if we already have a record for this exercise
      const { data: existingHistory } = await supabase
        .from('exercise_history')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('user_id', userId)
        .single();
      
      // Make sure we're not decreasing the set count unintentionally
      const finalSets = existingHistory ? Math.max(sets, existingHistory.sets) : sets;
      const finalWeight = existingHistory ? Math.max(weight, existingHistory.weight) : weight;
      
      const { error } = await supabase
        .from('exercise_history')
        .upsert({
          user_id: userId,
          exercise_id: exerciseId,
          weight: finalWeight,
          reps: reps,
          sets: finalSets,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,exercise_id'
        });
      
      if (error) throw error;
      
      return createSuccessResult(true);
    } catch (error) {
      console.error('Error updating exercise history:', error);
      return createErrorResult(error);
    }
  }
}
