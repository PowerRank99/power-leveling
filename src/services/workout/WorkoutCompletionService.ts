
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise, PersonalRecord } from '@/types/workoutTypes';
import { XPService } from '@/services/rpg/XPService';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';

/**
 * Service for completing workouts and handling related operations
 */
export class WorkoutCompletionService {
  /**
   * Complete a workout and perform all related operations
   * 
   * @param workoutId The ID of the workout to complete
   * @param durationSeconds Optional duration in seconds
   * @returns A ServiceResponse indicating success or failure
   */
  static async finishWorkout(workoutId: string, durationSeconds?: number): Promise<boolean> {
    try {
      // Start a database transaction
      await supabase.rpc('begin_transaction');
      
      // Fetch workout data
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('user_id, routine_id')
        .eq('id', workoutId)
        .single();
      
      if (workoutError || !workout) {
        await supabase.rpc('rollback_transaction');
        console.error('Error fetching workout:', workoutError);
        return false;
      }
      
      const userId = workout.user_id;
      
      // Fetch workout exercises data
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_sets')
        .select('*')
        .eq('workout_id', workoutId)
        .order('set_order', { ascending: true });
        
      if (exercisesError) {
        await supabase.rpc('rollback_transaction');
        console.error('Error fetching workout exercises:', exercisesError);
        return false;
      }
      
      // Process exercises data into a format suitable for XP calculation
      const exerciseMap = new Map();
      exercisesData?.forEach(set => {
        if (!exerciseMap.has(set.exercise_id)) {
          exerciseMap.set(set.exercise_id, {
            id: set.exercise_id,
            sets: []
          });
        }
        
        exerciseMap.get(set.exercise_id).sets.push({
          id: set.id,
          weight: set.weight,
          reps: set.reps,
          completed: set.completed
        });
      });
      
      const workoutExercises: WorkoutExercise[] = Array.from(exerciseMap.values());
      
      // Check for personal records
      await XPService.checkForPersonalRecords(userId, workoutId);
      
      // Handle streak calculations and XP award
      const personalRecords: PersonalRecord[] = []; // Placeholder, will be populated by backend
      await this.handleStreakAndXP(userId, workoutExercises, durationSeconds || 0, personalRecords);
      
      // Update workout completion status
      const { error: updateError } = await supabase
        .from('workouts')
        .update({ 
          completed_at: new Date().toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', workoutId);
      
      if (updateError) {
        await supabase.rpc('rollback_transaction');
        console.error('Error updating workout completion status:', updateError);
        return false;
      }
      
      // Commit the transaction
      await supabase.rpc('commit_transaction');
      
      return true;
    } catch (error) {
      await supabase.rpc('rollback_transaction');
      console.error('Error completing workout:', error);
      return false;
    }
  }

  /**
   * Discard a workout
   */
  static async discardWorkout(workoutId: string): Promise<boolean> {
    try {
      // Delete the workout sets first (due to foreign key constraints)
      const { error: setsError } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_id', workoutId);
        
      if (setsError) {
        console.error('Error deleting workout sets:', setsError);
        return false;
      }
      
      // Delete the workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (workoutError) {
        console.error('Error deleting workout:', workoutError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error discarding workout:', error);
      return false;
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
      
      // Calculate workout data
      const streak = profile.streak || 0;
      const userClass = profile.class;
      
      // Award XP based on workout data
      const xpAwarded = await XPService.awardWorkoutXP(userId, durationSeconds);
      
      // Log XP awarded
      console.log(`XP awarded: ${xpAwarded}`);
      
      // Update user's streak
      const { error: streakError } = await supabase
        .from('profiles')
        .update({ 
          streak: streak + 1, 
          last_workout_at: new Date().toISOString() 
        })
        .eq('id', userId);
      
      if (streakError) {
        console.error('Error updating streak:', streakError);
      }
    } catch (error) {
      console.error('Error handling streak and XP:', error);
    }
  }
}
