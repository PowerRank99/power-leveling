
import { ProfileService } from '@/services/profile/ProfileService';
import { StreakService } from '@/services/rpg/StreakService';
import { XPService } from '@/services/rpg/XPService';
import { WorkoutExerciseService } from './WorkoutExerciseService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for processing workout completion
 */
export class WorkoutCompletionService {
  /**
   * Process workout completion
   */
  public static async processWorkoutCompletion(
    userId: string,
    workoutId: string,
    durationSeconds: number,
    exerciseCount: number,
    setCount: number,
    exerciseCategories: string[]
  ): Promise<{ xp: number; streakUpdated: boolean; }> {
    try {
      // Validate inputs
      if (!userId || !workoutId) {
        throw new Error('Invalid input: userId and workoutId are required.');
      }

      // Award XP for completing the workout
      const xp = await XPService.calculateWorkoutXP(durationSeconds, exerciseCount, setCount);
      await XPService.awardXP(userId, xp, 'workout', { workoutId });

      // Update user's workout streak
      const streakUpdated = await StreakService.updateStreak(userId);

      // Update user's profile stats
      await ProfileService.updateProfileStats(userId, durationSeconds, exerciseCount, setCount);

      // Update workout exercises
      await WorkoutExerciseService.processWorkoutExercises(workoutId);
      
      // Check for workout-related achievements
      await AchievementService.checkWorkoutAchievements(userId, workoutId);

      return { xp, streakUpdated };
    } catch (error) {
      console.error('Error processing workout completion:', error);
      return { xp: 0, streakUpdated: false };
    }
  }

  /**
   * Finish a workout and mark it as completed
   */
  public static async finishWorkout(workoutId: string, durationSeconds: number): Promise<boolean> {
    try {
      if (!workoutId) {
        console.error('No workout ID provided');
        return false;
      }

      // Get workout details
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .select('user_id')
        .eq('id', workoutId)
        .single();

      if (workoutError || !workout) {
        console.error('Error fetching workout:', workoutError);
        return false;
      }

      // Mark workout as completed
      const { error: updateError } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', workoutId);

      if (updateError) {
        console.error('Error updating workout completion:', updateError);
        return false;
      }

      // Get workout exercises and sets count
      const { data: sets, error: setsError } = await supabase
        .from('workout_sets')
        .select('exercise_id')
        .eq('workout_id', workoutId)
        .is('completed', true);

      if (setsError) {
        console.error('Error fetching workout sets:', setsError);
        return false;
      }

      const exerciseIds = [...new Set(sets?.map(s => s.exercise_id) || [])];
      const exerciseCount = exerciseIds.length;
      const setCount = sets?.length || 0;

      // Get exercise categories
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('type')
        .in('id', exerciseIds);

      if (exercisesError) {
        console.error('Error fetching exercise types:', exercisesError);
        return false;
      }

      const exerciseCategories = [...new Set(exercises?.map(e => e.type) || [])];

      // Process the workout completion (XP, streak, achievements)
      await this.processWorkoutCompletion(
        workout.user_id,
        workoutId,
        durationSeconds,
        exerciseCount,
        setCount,
        exerciseCategories
      );

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
      if (!workoutId) {
        console.error('No workout ID provided');
        return false;
      }

      // Delete workout sets first (foreign key constraint)
      const { error: setsError } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_id', workoutId);

      if (setsError) {
        console.error('Error deleting workout sets:', setsError);
        return false;
      }

      // Then delete the workout
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
