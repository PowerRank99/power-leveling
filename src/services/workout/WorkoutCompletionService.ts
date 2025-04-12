
import { supabase } from '@/integrations/supabase/client';
import { XPService } from '@/services/rpg/XPService';
import { StreakService } from '@/services/rpg/StreakService';
import { WorkoutExerciseService } from './WorkoutExerciseService';
import { ProfileService } from '../profile/ProfileService';
import { AchievementService } from '@/services/rpg/AchievementService';

/**
 * Service for completing workouts
 */
export class WorkoutCompletionService {
  /**
   * Finish a workout and award XP
   */
  public static async finishWorkout(
    workoutId: string, 
    durationSeconds: number
  ): Promise<boolean> {
    try {
      // Get workout data
      const { data: workout, error: fetchError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
      
      if (fetchError || !workout) {
        console.error('Error fetching workout:', fetchError);
        return false;
      }
      
      const userId = workout.user_id;
      if (!userId) {
        console.error('No user ID associated with workout');
        return false;
      }
      
      // Complete workout
      const { error: updateError } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', workoutId);
      
      if (updateError) {
        console.error('Error updating workout:', updateError);
        return false;
      }
      
      // Award XP using the corrected method signature
      await XPService.awardWorkoutXP(userId, workout, durationSeconds);
      
      // Update user streak
      await StreakService.updateStreak(userId);
      
      // Process workout exercises
      await WorkoutExerciseService.processWorkoutExercises(workoutId);
      
      // Update profile stats
      await ProfileService.updateProfileStats(userId, durationSeconds, 0, 0);
      
      // Check for achievements
      await AchievementService.checkWorkoutAchievements(userId, workoutId);
      
      return true;
    } catch (error) {
      console.error('Error in finishWorkout:', error);
      return false;
    }
  }
  
  /**
   * Discard a workout
   */
  public static async discardWorkout(workoutId: string): Promise<boolean> {
    try {
      // Delete workout sets
      const { error: setsError } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_id', workoutId);
      
      if (setsError) {
        console.error('Error deleting workout sets:', setsError);
        return false;
      }
      
      // Delete workout
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
      console.error('Error in discardWorkout:', error);
      return false;
    }
  }
}
