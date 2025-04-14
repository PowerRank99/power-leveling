
import { supabase } from '@/integrations/supabase/client';
import { DatabaseResult } from '@/types/workoutTypes';
import { createSuccessResult, createErrorResult, createVoidSuccessResult } from '@/utils/serviceUtils';
import { ServiceErrorHandler } from '../common/ServiceErrorHandler';
import { SetOrderingService } from './SetOrderingService';

/**
 * Service responsible for deleting workout sets
 */
export class SetDeleteService {
  /**
   * Deletes a set from the database
   */
  static async deleteSet(setId: string): Promise<DatabaseResult<void>> {
    return ServiceErrorHandler.executeWithErrorHandling(
      async () => {
        console.log(`[SetDeleteService] Deleting set ${setId}`);
        
        // Get exercise_id and workout_id before deletion for reordering
        const { data: setData, error: fetchError } = await supabase
          .from('workout_sets')
          .select('exercise_id, workout_id')
          .eq('id', setId)
          .single();
          
        if (fetchError) {
          throw fetchError;
        }
        
        // Delete the set
        const { error } = await supabase
          .from('workout_sets')
          .delete()
          .eq('id', setId);
          
        if (error) {
          throw error;
        }
        
        // Reorder the remaining sets
        if (setData?.exercise_id && setData?.workout_id) {
          await SetOrderingService.normalizeSetOrders(
            setData.workout_id, 
            setData.exercise_id
          );
        }
        
        return;
      },
      'deleteSet',
      { errorMessage: 'Failed to delete set' }
    );
  }
  
  /**
   * Reorder sets after deletion to ensure consistent ordering
   */
  static async reorderSets(
    workoutId: string,
    exerciseId: string
  ): Promise<DatabaseResult<void>> {
    return ServiceErrorHandler.executeWithErrorHandling(
      async () => {
        await SetOrderingService.normalizeSetOrders(workoutId, exerciseId);
        return;
      },
      'reorderSets',
      { errorMessage: 'Failed to reorder sets' }
    );
  }
}
