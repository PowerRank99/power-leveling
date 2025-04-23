import { supabase } from '@/integrations/supabase/client';
import { ManualWorkout } from '@/types/manualWorkoutTypes';
import { ManualWorkoutValidationService } from './ManualWorkoutValidationService';
import { XPService } from '@/services/xp/XPService';
import { ActivityBonusService } from './ActivityBonusService';
import { AchievementService } from '@/services/rpg/AchievementService';

export class ManualWorkoutService {
  /**
   * Submit a manual workout
   */
  static async submitManualWorkout(
    userId: string,
    photoUrl: string,
    description: string,
    exerciseType: string,
    workoutDate: Date
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Get user's class for bonuses
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('class, workouts_count')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching user class:', profileError);
        return { success: false, error: 'Error fetching user profile' };
      }

      // Validate the submission
      const isValid = await ManualWorkoutValidationService.validateWorkoutSubmission(
        userId,
        photoUrl,
        workoutDate
      );
      
      if (!isValid) {
        return { success: false, error: 'Validação falhou' };
      }
      
      // Check if this is a power day
      const isPowerDay = await ManualWorkoutValidationService.checkPowerDay(userId);
      
      // Calculate base XP
      let xpAwarded = isPowerDay 
        ? XPService.MANUAL_WORKOUT_BASE_XP + XPService.POWER_DAY_BONUS_XP 
        : XPService.MANUAL_WORKOUT_BASE_XP;
      
      // Apply class bonuses if applicable
      const classBonus = ActivityBonusService.getClassBonus(profile?.class || '', exerciseType);
      if (classBonus > 0) {
        const bonusXP = Math.floor(xpAwarded * classBonus);
        xpAwarded += bonusXP;
        console.log(`Applied class bonus: +${bonusXP} XP (${classBonus * 100}%)`);
      }
      
      // Begin transaction
      await supabase.rpc('begin_transaction');
      
      try {
        // Create the manual workout record
        const { data: workoutData, error: workoutError } = await supabase
          .from('manual_workouts')
          .insert({
            user_id: userId,
            description: description || null,
            activity_type: exerciseType,
            photo_url: photoUrl,
            xp_awarded: xpAwarded,
            workout_date: workoutDate.toISOString(),
            is_power_day: isPowerDay
          })
          .select()
          .single();
        
        if (workoutError) throw workoutError;
        
        // Use the new combined function to handle both workout completion and XP
        const { error: completionError } = await supabase.rpc(
          'handle_manual_workout_completion_with_xp',
          {
            p_user_id: userId,
            p_workout_date: workoutDate.toISOString(),
            p_xp_amount: xpAwarded,
            p_xp_source: `manual_workout:${exerciseType}`
          }
        );
          
        if (completionError) throw completionError;
        
        // Get updated profile data to ensure we have the latest workouts_count
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .select('workouts_count')
          .eq('id', userId)
          .single();
          
        if (updateError) throw updateError;
        
        // Log the current state for debugging
        console.log('Current workout count:', updatedProfile.workouts_count);
        
        // Check for achievements after workout completion
        await AchievementService.checkAchievements(userId);
        
        // Commit transaction
        await supabase.rpc('commit_transaction');
        
        return { success: true, data: workoutData };
        
      } catch (error) {
        // Rollback transaction on error
        await supabase.rpc('rollback_transaction');
        throw error;
      }
      
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
