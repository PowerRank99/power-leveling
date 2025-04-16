import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExerciseHistory } from '@/types/workoutTypes';

/**
 * Service for managing exercise history data
 */
export class ExerciseHistoryService {
  /**
   * Get exercise history for a specific user and exercise
   */
  static async getExerciseHistory(exerciseId: string) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.warn('[ExerciseHistoryService] No authenticated user found');
        return null;
      }
      
      const { data, error } = await supabase
        .from('exercise_history')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('user_id', userData.user.id)
        .single();
        
      if (error) {
        console.error('[ExerciseHistoryService] Error fetching exercise history:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('[ExerciseHistoryService] Exception fetching exercise history:', error);
      return null;
    }
  }
  
  /**
   * Get exercise history for multiple exercises
   */
  static async getMultipleExerciseHistory(exerciseIds: string[]) {
    if (!exerciseIds.length) return {};
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.warn('[ExerciseHistoryService] No authenticated user found');
        return {};
      }
      
      const { data, error } = await supabase
        .from('exercise_history')
        .select('*')
        .in('exercise_id', exerciseIds)
        .eq('user_id', userData.user.id);
        
      if (error) {
        console.error('[ExerciseHistoryService] Error fetching multiple exercise history:', error);
        return {};
      }
      
      // Convert to a map for easier lookup
      const historyMap: Record<string, any> = {};
      data?.forEach(record => {
        historyMap[record.exercise_id] = record;
      });
      
      return historyMap;
    } catch (error) {
      console.error('[ExerciseHistoryService] Exception fetching multiple exercise history:', error);
      return {};
    }
  }
  
  /**
   * Update exercise history based on workout data
   * This is a critical method that ensures consistency between routine_exercises.target_sets
   * and exercise_history.sets
   */
  static async updateExerciseHistory(
    exerciseId: string,
    weight: number,
    reps: number,
    sets: number
  ) {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error('[ExerciseHistoryService] No authenticated user found');
        return false;
      }
      
      const userId = userData.user.id;
      
      console.log('[ExerciseHistoryService] Updating exercise history:', {
        exerciseId, weight, reps, sets, userId
      });
      
      // First, check if we already have a record for this exercise
      const { data: existingHistory } = await supabase
        .from('exercise_history')
        .select('*')
        .eq('exercise_id', exerciseId)
        .eq('user_id', userId)
        .single();
      
      // Make sure we're not decreasing the set count unintentionally
      // Only update the set count if it's higher than existing or if no existing record
      const finalSets = existingHistory ? Math.max(sets, existingHistory.sets) : sets;
      
      // Also make sure we're capturing the highest weight used (not just the latest)
      const finalWeight = existingHistory ? Math.max(weight, existingHistory.weight) : weight;
      
      // For reps, we'll just use the provided value as it represents the current exercise setting
      
      const { data, error } = await supabase
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
        })
        .select()
        .single();
      
      if (error) {
        console.error('[ExerciseHistoryService] Error updating exercise history:', error);
        toast.error('Erro ao salvar histórico de exercício', {
          description: 'Não foi possível atualizar o histórico deste exercício'
        });
        return false;
      }
      
      console.log('[ExerciseHistoryService] Successfully updated exercise history:', data);
      return true;
    } catch (error) {
      console.error('[ExerciseHistoryService] Exception updating exercise history:', error);
      return false;
    }
  }
}
