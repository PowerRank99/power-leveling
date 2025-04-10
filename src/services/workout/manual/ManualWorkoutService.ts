
import { supabase } from '@/integrations/supabase/client';
import { ManualWorkout } from '@/types/manualWorkoutTypes';
import { ManualWorkoutValidationService } from './ManualWorkoutValidationService';
import { XPService } from '@/services/xp/XPService';

export class ManualWorkoutService {
  /**
   * Submit a manual workout
   */
  static async submitManualWorkout(
    userId: string,
    photoUrl: string,
    description: string,
    exerciseId: string,
    exerciseName: string,
    exerciseCategory: string,
    workoutDate: Date
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Validate the submission
      const isValid = await ManualWorkoutValidationService.validateWorkoutSubmission(
        userId,
        photoUrl,
        workoutDate
      );
      
      if (!isValid) {
        return { success: false, error: 'Validação falhou' };
      }
      
      // Check if this is a power day (user has completed a workout today)
      const isPowerDay = await ManualWorkoutValidationService.checkPowerDay(userId);
      
      // Calculate XP (base: 100 XP, power day bonus: +50 XP)
      const xpAwarded = isPowerDay 
        ? XPService.MANUAL_WORKOUT_BASE_XP + XPService.POWER_DAY_BONUS_XP 
        : XPService.MANUAL_WORKOUT_BASE_XP;
      
      // Add XP to user - fixing the argument count here (passing metadata as part of the source parameter)
      await XPService.addXP(userId, xpAwarded, `manual_workout:${exerciseName}:${exerciseCategory}`);
      
      console.log('Creating manual workout with exercise_id:', exerciseId);
      
      // Since we're getting a TypeScript error about the p_exercise_id parameter,
      // let's check if the SQL migration was properly applied by using a more direct approach
      // We'll execute a direct INSERT query instead of using the RPC function
      const { data, error } = await supabase
        .from('manual_workouts')
        .insert({
          user_id: userId,
          description: description || null,
          activity_type: exerciseName || null,
          exercise_id: exerciseId,
          photo_url: photoUrl,
          xp_awarded: xpAwarded,
          workout_date: workoutDate.toISOString(),
          is_power_day: isPowerDay
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating manual workout:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
      
    } catch (error: any) {
      console.error('Error in submitManualWorkout:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }
  
  /**
   * Get manual workouts for a user
   */
  static async getUserManualWorkouts(userId: string): Promise<ManualWorkout[]> {
    try {
      // We'll also switch to using a direct query instead of the RPC function
      // to make sure we're getting all fields including exercise_id
      const { data, error } = await supabase
        .from('manual_workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching manual workouts:', error);
        return [];
      }
      
      return data.map((workout: any) => ({
        id: workout.id,
        description: workout.description,
        activityType: workout.activity_type,
        exerciseId: workout.exercise_id,
        photoUrl: workout.photo_url,
        xpAwarded: workout.xp_awarded,
        isPowerDay: workout.is_power_day,
        createdAt: workout.created_at,
        workoutDate: workout.workout_date
      }));
      
    } catch (error) {
      console.error('Error in getUserManualWorkouts:', error);
      return [];
    }
  }
  
  /**
   * Delete a manual workout
   */
  static async deleteManualWorkout(
    userId: string,
    workoutId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First get the workout to check if it belongs to the user
      const { data: workouts, error: fetchError } = await supabase
        .from('manual_workouts')
        .select('id, user_id, photo_url')
        .eq('id', workoutId)
        .eq('user_id', userId)
        .limit(1);
        
      if (fetchError) {
        throw new Error(`Error fetching workout: ${fetchError.message}`);
      }
      
      if (!workouts || workouts.length === 0) {
        return { success: false, error: 'Treino não encontrado ou você não tem permissão' };
      }
      
      const workout = workouts[0];
      
      // Delete the workout from database
      const { error: deleteError } = await supabase
        .from('manual_workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', userId);
        
      if (deleteError) {
        throw new Error(`Error deleting workout: ${deleteError.message}`);
      }
      
      // Try to delete the photo from storage if available
      // We don't throw errors here as the workout was already deleted
      try {
        if (workout.photo_url) {
          // Extract the file path from the URL
          const url = new URL(workout.photo_url);
          const pathSegments = url.pathname.split('/');
          const fileName = pathSegments[pathSegments.length - 1];
          
          if (fileName) {
            await supabase.storage
              .from('workout-photos')
              .remove([fileName]);
          }
        }
      } catch (photoError) {
        console.warn('Failed to delete workout photo:', photoError);
        // Continue anyway as the workout record was deleted
      }
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Error in deleteManualWorkout:', error);
      return { success: false, error: error.message || 'Error deleting workout' };
    }
  }
}
