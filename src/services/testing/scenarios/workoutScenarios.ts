
import { scenarioRunner, TestScenario, ScenarioResult } from './index';
import { supabase } from '@/integrations/supabase/client';

/**
 * Basic Workout Scenario - Creates a simple workout
 */
const basicWorkoutScenario: TestScenario = {
  id: 'basic-workout',
  name: 'Basic Workout',
  description: 'Creates a basic workout with a few sets to test workout-related achievements',
  tags: ['workout', 'basic'],
  achievementTypes: ['workout'],
  
  execute: async (userId: string): Promise<ScenarioResult> => {
    try {
      // Create a workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // Started 30 minutes ago
          completed_at: new Date().toISOString(),
          duration_seconds: 1800 // 30 minutes
        })
        .select('id')
        .single();
        
      if (workoutError || !workout) {
        return {
          success: false,
          message: `Error creating workout: ${workoutError?.message}`
        };
      }
      
      // Add a few sets to the workout
      const { error: setError } = await supabase
        .from('workout_sets')
        .insert([
          {
            workout_id: workout.id,
            exercise_id: '550e8400-e29b-41d4-a716-446655440000', // Sample exercise ID
            set_order: 1,
            weight: 50,
            reps: 10,
            completed: true,
            completed_at: new Date().toISOString()
          },
          {
            workout_id: workout.id,
            exercise_id: '550e8400-e29b-41d4-a716-446655440000', // Sample exercise ID
            set_order: 2,
            weight: 55,
            reps: 8,
            completed: true,
            completed_at: new Date(Date.now() + 1000 * 60 * 2).toISOString() // 2 minutes after first set
          }
        ]);
        
      if (setError) {
        return {
          success: false,
          message: `Error creating workout sets: ${setError.message}`
        };
      }
      
      // Update user profile to reflect the workout
      const { error: profileError } = await supabase
        .rpc('increment_profile_counter', {
          user_id_param: userId,
          counter_name: 'workouts_count',
          increment_amount: 1
        });
        
      if (profileError) {
        return {
          success: false,
          message: `Error updating profile: ${profileError.message}`
        };
      }
      
      // Update profile last_workout_at
      const { error: lastWorkoutError } = await supabase
        .from('profiles')
        .update({
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (lastWorkoutError) {
        return {
          success: false,
          message: `Error updating last workout time: ${lastWorkoutError.message}`
        };
      }
      
      return {
        success: true,
        message: 'Basic workout scenario executed successfully',
        data: {
          workoutId: workout.id
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};

/**
 * Three Day Streak Scenario - Creates workouts for 3 consecutive days
 */
const threeDayStreakScenario: TestScenario = {
  id: 'three-day-streak',
  name: 'Three Day Streak',
  description: 'Simulates completing workouts on three consecutive days to test streak achievements',
  tags: ['streak', 'workout'],
  achievementTypes: ['streak'],
  
  execute: async (userId: string): Promise<ScenarioResult> => {
    try {
      // Create workouts for the last 3 days
      for (let i = 2; i >= 0; i--) {
        const workoutDate = new Date();
        workoutDate.setDate(workoutDate.getDate() - i);
        
        // Create the workout
        const { data: workout, error: workoutError } = await supabase
          .from('workouts')
          .insert({
            user_id: userId,
            started_at: new Date(workoutDate.getTime() - 1000 * 60 * 30).toISOString(),
            completed_at: workoutDate.toISOString(),
            duration_seconds: 1800 // 30 minutes
          })
          .select('id')
          .single();
          
        if (workoutError || !workout) {
          return {
            success: false,
            message: `Error creating workout for day ${i}: ${workoutError?.message}`
          };
        }
        
        // Add a set to each workout
        const { error: setError } = await supabase
          .from('workout_sets')
          .insert({
            workout_id: workout.id,
            exercise_id: '550e8400-e29b-41d4-a716-446655440000', // Sample exercise ID
            set_order: 1,
            weight: 50,
            reps: 10,
            completed: true,
            completed_at: workoutDate.toISOString()
          });
          
        if (setError) {
          return {
            success: false,
            message: `Error creating workout set for day ${i}: ${setError.message}`
          };
        }
      }
      
      // Update user profile workout count and streak
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          workouts_count: supabase.rpc('increment_by', { value: 3 }),
          streak: 3,
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (profileError) {
        return {
          success: false,
          message: `Error updating profile: ${profileError.message}`
        };
      }
      
      return {
        success: true,
        message: 'Three day streak scenario executed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};

// Register scenarios
scenarioRunner.registerScenario(basicWorkoutScenario);
scenarioRunner.registerScenario(threeDayStreakScenario);
