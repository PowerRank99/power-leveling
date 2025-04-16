
import { scenarioRunner, TestScenario, ScenarioResult } from './index';
import { supabase } from '@/integrations/supabase/client';

/**
 * Seven Day Streak Scenario - Simulates a 7-day workout streak
 */
const sevenDayStreakScenario: TestScenario = {
  id: 'seven-day-streak',
  name: 'Seven Day Streak',
  description: 'Simulates completing workouts on seven consecutive days',
  tags: ['streak', 'workout', 'advanced'],
  achievementTypes: ['streak'],
  
  execute: async (userId: string): Promise<ScenarioResult> => {
    try {
      // Create workouts for the last 7 days
      for (let i = 6; i >= 0; i--) {
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
          workouts_count: supabase.rpc('increment_by', { value: 7 }),
          streak: 7,
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
        message: 'Seven day streak scenario executed successfully'
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
 * Streak Break Scenario - Simulates breaking a streak after several days
 */
const streakBreakScenario: TestScenario = {
  id: 'streak-break',
  name: 'Streak Break',
  description: 'Simulates a streak being broken after several days of consistent workouts',
  tags: ['streak', 'workout'],
  achievementTypes: ['streak'],
  
  execute: async (userId: string): Promise<ScenarioResult> => {
    try {
      // Create workouts for 5 days in a row, then skip 2 days, then do 1 more
      const daysWithWorkout = [8, 7, 6, 5, 4, 1]; // Days ago
      
      for (const daysAgo of daysWithWorkout) {
        const workoutDate = new Date();
        workoutDate.setDate(workoutDate.getDate() - daysAgo);
        
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
            message: `Error creating workout for ${daysAgo} days ago: ${workoutError?.message}`
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
            message: `Error creating workout set for ${daysAgo} days ago: ${setError.message}`
          };
        }
      }
      
      // Update user profile workout count and streak
      // Streak should be 1 because the most recent workout was after a 2-day break
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          workouts_count: supabase.rpc('increment_by', { value: daysWithWorkout.length }),
          streak: 1,
          last_workout_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() // 1 day ago
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
        message: 'Streak break scenario executed successfully'
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
scenarioRunner.registerScenario(sevenDayStreakScenario);
scenarioRunner.registerScenario(streakBreakScenario);
