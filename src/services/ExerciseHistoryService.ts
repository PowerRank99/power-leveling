
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
      const { data, error } = await supabase
        .from('exercise_history')
        .select('*')
        .eq('exercise_id', exerciseId)
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
      const { data, error } = await supabase
        .from('exercise_history')
        .select('*')
        .in('exercise_id', exerciseIds);
        
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
   * Update exercise history after completing sets
   */
  static async updateExerciseHistory(
    exerciseId: string,
    weight: number,
    reps: number,
    sets: number
  ) {
    try {
      console.log('[ExerciseHistoryService] Updating exercise history:', {
        exerciseId, weight, reps, sets
      });
      
      // Get the current user ID from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('[ExerciseHistoryService] No authenticated user found');
        return false;
      }
      
      const { data, error } = await supabase
        .from('exercise_history')
        .upsert({
          user_id: user.id,
          exercise_id: exerciseId,
          weight,
          reps,
          sets,
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
      
      return true;
    } catch (error) {
      console.error('[ExerciseHistoryService] Exception updating exercise history:', error);
      return false;
    }
  }
}
