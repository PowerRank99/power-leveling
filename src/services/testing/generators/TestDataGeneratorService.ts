
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class TestDataGenerator {
  /**
   * Generate standard test data for achievement testing
   */
  async generateStandardTestData(userId: string): Promise<boolean> {
    try {
      await this.generateUserProfile(userId);
      await this.generateWorkoutHistory(userId);
      await this.generateExerciseData(userId);
      await this.generateStreakData(userId);
      
      return true;
    } catch (error) {
      console.error('Error generating test data:', error);
      throw error;
    }
  }
  
  /**
   * Clean up all test data for a user
   */
  async cleanupAllTestData(userId: string): Promise<boolean> {
    try {
      // Clean up user achievements
      const { error: achievementError } = await supabase
        .from('user_achievements')
        .delete()
        .eq('user_id', userId);
        
      if (achievementError) {
        console.error('Error cleaning up user achievements:', achievementError);
      }
      
      // Clean up achievement progress
      const { error: progressError } = await supabase
        .from('achievement_progress')
        .delete()
        .eq('user_id', userId);
        
      if (progressError) {
        console.error('Error cleaning up achievement progress:', progressError);
      }
      
      // Clean up workouts and workout sets
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', userId);
        
      if (workoutsError) {
        console.error('Error fetching workouts:', workoutsError);
      } else if (workouts?.length) {
        for (const workout of workouts) {
          const { error: setsError } = await supabase
            .from('workout_sets')
            .delete()
            .eq('workout_id', workout.id);
            
          if (setsError) {
            console.error(`Error cleaning up sets for workout ${workout.id}:`, setsError);
          }
        }
        
        const { error: deleteWorkoutsError } = await supabase
          .from('workouts')
          .delete()
          .eq('user_id', userId);
          
        if (deleteWorkoutsError) {
          console.error('Error cleaning up workouts:', deleteWorkoutsError);
        }
      }
      
      // Clean up manual workouts
      const { error: manualWorkoutError } = await supabase
        .from('manual_workouts')
        .delete()
        .eq('user_id', userId);
        
      if (manualWorkoutError) {
        console.error('Error cleaning up manual workouts:', manualWorkoutError);
      }
      
      // Clean up personal records
      const { error: recordsError } = await supabase
        .from('personal_records')
        .delete()
        .eq('user_id', userId);
        
      if (recordsError) {
        console.error('Error cleaning up personal records:', recordsError);
      }
      
      // Clean up exercise history
      const { error: exerciseHistoryError } = await supabase
        .from('exercise_history')
        .delete()
        .eq('user_id', userId);
        
      if (exerciseHistoryError) {
        console.error('Error cleaning up exercise history:', exerciseHistoryError);
      }
      
      // Reset profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          workouts_count: 0,
          achievements_count: 0,
          records_count: 0,
          streak: 0,
          xp: 0,
          daily_xp: 0,
          achievement_points: 0,
          last_workout_at: null
        })
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error resetting profile:', profileError);
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning up test data:', error);
      throw error;
    }
  }
  
  /**
   * Generate user profile data
   */
  private async generateUserProfile(userId: string): Promise<void> {
    // Reset profile to clean state
    const { error } = await supabase
      .from('profiles')
      .update({
        workouts_count: 0,
        achievements_count: 0,
        records_count: 0,
        streak: 0,
        xp: 0,
        daily_xp: 0,
        achievement_points: 0,
        last_workout_at: null,
        class: 'Aventureiro',
        level: 1
      })
      .eq('id', userId);
      
    if (error) {
      throw new Error(`Error generating user profile: ${error.message}`);
    }
  }
  
  /**
   * Generate workout history
   */
  private async generateWorkoutHistory(userId: string): Promise<void> {
    try {
      // Get sample exercises
      const { data: exercises, error: exerciseError } = await supabase
        .from('exercises')
        .select('id, name, category')
        .limit(5);
        
      if (exerciseError || !exercises?.length) {
        throw new Error(`Error getting exercises: ${exerciseError?.message}`);
      }
      
      // Create sample workouts
      for (let i = 0; i < 3; i++) {
        const { data: workout, error: workoutError } = await supabase
          .from('workouts')
          .insert({
            user_id: userId,
            started_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000) - 1000 * 60 * 60).toISOString(),
            completed_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
            duration_seconds: 3600,
            routine_id: null
          })
          .select('id')
          .single();
          
        if (workoutError || !workout) {
          throw new Error(`Error creating workout: ${workoutError?.message}`);
        }
        
        // Add sets to the workout
        for (let j = 0; j < 3; j++) {
          const exercise = exercises[j % exercises.length];
          
          const { error: setError } = await supabase
            .from('workout_sets')
            .insert({
              workout_id: workout.id,
              exercise_id: exercise.id,
              set_order: j + 1,
              weight: 50 + j * 5,
              reps: 10,
              completed: true,
              completed_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000) - 1000 * 60 * (30 - j * 10)).toISOString()
            });
            
          if (setError) {
            throw new Error(`Error creating workout set: ${setError.message}`);
          }
        }
      }
      
      // Update profile workout count
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          workouts_count: 3,
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
    } catch (error) {
      console.error('Error generating workout history:', error);
      throw error;
    }
  }
  
  /**
   * Generate exercise data
   */
  private async generateExerciseData(userId: string): Promise<void> {
    try {
      // Get sample exercises
      const { data: exercises, error: exerciseError } = await supabase
        .from('exercises')
        .select('id, name, category')
        .limit(5);
        
      if (exerciseError || !exercises?.length) {
        throw new Error(`Error getting exercises: ${exerciseError?.message}`);
      }
      
      // Create exercise history
      for (const exercise of exercises) {
        const { error } = await supabase
          .from('exercise_history')
          .insert({
            user_id: userId,
            exercise_id: exercise.id,
            weight: 50,
            reps: 10,
            sets: 3,
            last_used_at: new Date().toISOString()
          });
          
        if (error) {
          throw new Error(`Error creating exercise history: ${error.message}`);
        }
      }
      
      // Create personal records
      const { error: recordError } = await supabase
        .from('personal_records')
        .insert({
          user_id: userId,
          exercise_id: exercises[0].id,
          weight: 100,
          previous_weight: 90,
          recorded_at: new Date().toISOString()
        });
        
      if (recordError) {
        throw new Error(`Error creating personal record: ${recordError.message}`);
      }
      
      // Update profile record count
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          records_count: 1
        })
        .eq('id', userId);
        
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
    } catch (error) {
      console.error('Error generating exercise data:', error);
      throw error;
    }
  }
  
  /**
   * Generate streak data
   */
  private async generateStreakData(userId: string): Promise<void> {
    try {
      // Set streak
      const { error } = await supabase
        .from('profiles')
        .update({
          streak: 3
        })
        .eq('id', userId);
        
      if (error) {
        throw new Error(`Error updating streak: ${error.message}`);
      }
    } catch (error) {
      console.error('Error generating streak data:', error);
      throw error;
    }
  }
}

// Singleton instance
export const testDataGenerator = new TestDataGenerator();
