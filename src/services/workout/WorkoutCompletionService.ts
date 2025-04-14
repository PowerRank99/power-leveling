import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise, PersonalRecord } from '@/types/workoutTypes';
import { mapToWorkoutExerciseData } from '@/utils/typeMappers';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { XPService } from '@/services/rpg/XPService';

/**
 * Service for completing workouts and handling related operations
 */
export class WorkoutCompletionService {
  /**
   * Complete a workout and perform all related operations
   * 
   * @param workoutId The ID of the workout to complete
   * @returns A ServiceResponse indicating success or failure
   */
  static async completeWorkout(workoutId: string): Promise<ServiceResponse<boolean>> {
    try {
      // Start a database transaction
      await supabase.rpc('start_transaction');
      
      // Fetch workout data
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('user_id, exercises, duration_seconds')
        .eq('id', workoutId)
        .single();
      
      if (workoutError || !workout) {
        await supabase.rpc('rollback_transaction');
        console.error('Error fetching workout:', workoutError);
        return { success: false, error: 'Workout not found' };
      }
      
      const userId = workout.user_id;
      const workoutExercises = mapToWorkoutExerciseData(workout.exercises as any[]);
      const workoutDuration = workout.duration_seconds || 0;
      
      // Check for personal records
      const personalRecords = await XPService.checkForPersonalRecords(userId, {
        id: workoutId,
        exercises: workoutExercises,
        durationSeconds: workoutDuration
      });
      
      // Handle streak calculations
      await this.handleStreakAndXP(userId, workoutExercises, workoutDuration, personalRecords);
      
      // Update workout completion status
      const { error: updateError } = await supabase
        .from('workouts')
        .update({ completed: true })
        .eq('id', workoutId);
      
      if (updateError) {
        await supabase.rpc('rollback_transaction');
        console.error('Error updating workout completion status:', updateError);
        return { success: false, error: 'Failed to update workout completion status' };
      }
      
      // Commit the transaction
      await supabase.rpc('commit_transaction');
      
      return { success: true, data: true };
    } catch (error) {
      await supabase.rpc('rollback_transaction');
      console.error('Error completing workout:', error);
      return { success: false, error: 'Failed to complete workout' };
    }
  }

  /**
   * Handle streak calculations and XP awards
   */
  private static async handleStreakAndXP(
    userId: string,
    exercises: WorkoutExercise[],
    durationSeconds: number,
    personalRecords: PersonalRecord[]
  ): Promise<void> {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('streak, class')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError);
        return;
      }
      
      // Calculate and award workout XP
      const userClass = profile.class;
      const streak = profile.streak || 0;
      
      const workoutData = {
        id: 'temp-id',
        exercises,
        durationSeconds,
        hasPR: personalRecords.length > 0
      };
      
      // Use the new awardWorkoutXP method from XPService
      const xpAwarded = await XPService.awardWorkoutXP(
        userId,
        workoutData,
        userClass,
        streak
      );
      
      // Log XP awarded
      console.log(`XP awarded: ${xpAwarded}`);
      
      // Update user's streak
      const { error: streakError } = await supabase
        .from('profiles')
        .update({ streak: streak + 1, last_workout_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (streakError) {
        console.error('Error updating streak:', streakError);
      }
    } catch (error) {
      console.error('Error handling streak and XP:', error);
    }
  }
}
