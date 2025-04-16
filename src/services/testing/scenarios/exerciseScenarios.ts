
import { scenarioRunner, TestScenario, ScenarioResult } from './index';
import { supabase } from '@/integrations/supabase/client';

/**
 * Personal Record Scenario - Creates a personal record
 */
const personalRecordScenario: TestScenario = {
  id: 'personal-record',
  name: 'Personal Record',
  description: 'Simulates achieving a personal record',
  tags: ['record', 'achievement'],
  achievementTypes: ['personal_record'],
  
  execute: async (userId: string): Promise<ScenarioResult> => {
    try {
      // Create a workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          completed_at: new Date().toISOString(),
          duration_seconds: 1800
        })
        .select('id')
        .single();
        
      if (workoutError || !workout) {
        return {
          success: false,
          message: `Error creating workout: ${workoutError?.message}`
        };
      }
      
      // First, make sure we have an exercise to work with
      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .select('id')
        .limit(1)
        .maybeSingle();
        
      if (exerciseError) {
        return {
          success: false,
          message: `Error fetching exercise: ${exerciseError.message}`
        };
      }
      
      // If no exercise exists, create a test one
      let exerciseId = exercise?.id;
      if (!exerciseId) {
        const { data: newExercise, error: newExerciseError } = await supabase
          .from('exercises')
          .insert({
            name: 'Test Bench Press',
            category: 'chest',
            type: 'strength',
            level: 'intermediate'
          })
          .select('id')
          .single();
          
        if (newExerciseError || !newExercise) {
          return {
            success: false,
            message: `Error creating exercise: ${newExerciseError?.message}`
          };
        }
        
        exerciseId = newExercise.id;
      }
      
      // Add a set with a new PR weight
      const { error: setError } = await supabase
        .from('workout_sets')
        .insert({
          workout_id: workout.id,
          exercise_id: exerciseId,
          set_order: 1,
          weight: 100, // New PR weight
          reps: 10,
          completed: true,
          completed_at: new Date().toISOString()
        });
        
      if (setError) {
        return {
          success: false,
          message: `Error creating workout set: ${setError.message}`
        };
      }
      
      // Create a personal record
      const { error: recordError } = await supabase
        .from('personal_records')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          weight: 100,
          previous_weight: 90,
          recorded_at: new Date().toISOString()
        });
        
      if (recordError) {
        return {
          success: false,
          message: `Error creating personal record: ${recordError.message}`
        };
      }
      
      // Update profile records count
      const { error: profileError } = await supabase
        .rpc('increment_profile_counter', {
          user_id_param: userId,
          counter_name: 'records_count',
          increment_amount: 1
        });
        
      if (profileError) {
        return {
          success: false,
          message: `Error updating profile: ${profileError.message}`
        };
      }
      
      return {
        success: true,
        message: 'Personal record scenario executed successfully',
        data: {
          exerciseId,
          weight: 100,
          previousWeight: 90
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

// Register scenarios
scenarioRunner.registerScenario(personalRecordScenario);
