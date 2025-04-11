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
      
      // Calculate XP (base: 50 XP, power day bonus: +50 XP)
      const xpAwarded = isPowerDay ? 100 : 50;
      
      // Add XP to user - fixing the argument count here (passing metadata as part of the source parameter)
      await XPService.addXP(userId, xpAwarded, `manual_workout:${exerciseName}:${exerciseCategory}`);
      
      // Call the database function to create the manual workout
      const { data, error } = await supabase.rpc('create_manual_workout', {
        p_user_id: userId,
        p_description: description || null,
        p_activity_type: exerciseName || null,
        p_exercise_id: exerciseId,
        p_photo_url: photoUrl,
        p_xp_awarded: xpAwarded,
        p_workout_date: workoutDate.toISOString(),
        p_is_power_day: isPowerDay
      });
      
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
      const { data, error } = await supabase.rpc('get_user_manual_workouts', {
        p_user_id: userId
      });
      
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
