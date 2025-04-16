
import { scenarioRunner } from './index';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

// Register a personal record scenario
scenarioRunner.registerScenario({
  id: 'first-personal-record',
  name: 'First Personal Record Achievement',
  description: 'Tests the achievement for setting your first personal record',
  tags: ['record', 'basic', 'rank-e'],
  achievementTypes: ['personal_record'],
  
  async execute(userId: string) {
    try {
      // Get or create a test exercise
      const { data: exercise } = await supabase
        .from('exercises')
        .select('id')
        .limit(1)
        .maybeSingle();
        
      if (!exercise) {
        throw new Error('No exercises found in database');
      }
      
      // Create personal record
      const { error: recordError } = await supabase
        .from('personal_records')
        .insert({
          user_id: userId,
          exercise_id: exercise.id,
          weight: 100,
          previous_weight: 90,
          recorded_at: new Date().toISOString()
        });
        
      if (recordError) {
        throw new Error(`Error creating personal record: ${recordError.message}`);
      }
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          records_count: 1
        })
        .eq('id', userId);
        
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
      
      // Find personal record achievement
      const { data: achievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('category', 'personal_record')
        .eq('requirements->count', 1)
        .maybeSingle();
      
      if (!achievement) {
        return {
          success: false,
          message: 'First personal record achievement not found in database'
        };
      }
      
      // Award the achievement
      const awardResult = await AchievementService.awardAchievement(userId, achievement.id);
      
      if (!awardResult.success) {
        return {
          success: false,
          message: `Failed to award achievement: ${awardResult.message}`
        };
      }
      
      // Verify achievement was awarded
      const { data: userAchievement, error: verifyError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .maybeSingle();
        
      if (verifyError) {
        throw new Error(`Error verifying achievement: ${verifyError.message}`);
      }
      
      return {
        success: !!userAchievement,
        message: userAchievement 
          ? 'Successfully awarded first personal record achievement' 
          : 'Failed to award achievement'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

// Register a category exercise completion scenario
scenarioRunner.registerScenario({
  id: 'category-exercises',
  name: 'Category Exercise Completion',
  description: 'Tests achievements for completing exercises in specific categories',
  tags: ['exercise', 'category', 'rank-c'],
  achievementTypes: ['workout_category'],
  
  async execute(userId: string) {
    try {
      // Get test exercise categories
      const { data: exerciseCategories } = await supabase
        .from('exercises')
        .select('id, category')
        .limit(5);
        
      if (!exerciseCategories?.length) {
        throw new Error('No exercises found in database');
      }
      
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
        throw new Error(`Error creating workout: ${workoutError?.message}`);
      }
      
      // Add sets for each exercise category
      for (let i = 0; i < exerciseCategories.length; i++) {
        const exercise = exerciseCategories[i];
        
        const { error: setError } = await supabase
          .from('workout_sets')
          .insert({
            workout_id: workout.id,
            exercise_id: exercise.id,
            set_order: i + 1,
            weight: 50,
            reps: 10,
            completed: true,
            completed_at: new Date().toISOString()
          });
          
        if (setError) {
          throw new Error(`Error creating workout set: ${setError.message}`);
        }
      }
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          workouts_count: supabase.rpc('increment_profile_counter', {
            user_id_param: userId,
            counter_name: 'workouts_count',
            increment_amount: 1
          })
        })
        .eq('id', userId);
        
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
      
      // Find workout category achievement for the first category
      const testCategory = exerciseCategories[0].category;
      
      const { data: achievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('category', 'workout_category')
        .filter('requirements->category', 'eq', testCategory)
        .filter('requirements->count', 'eq', 1)
        .maybeSingle();
      
      if (!achievement) {
        return {
          success: false,
          message: `Category achievement for ${testCategory} not found in database`
        };
      }
      
      // Award the achievement
      const awardResult = await AchievementService.awardAchievement(userId, achievement.id);
      
      if (!awardResult.success) {
        return {
          success: false,
          message: `Failed to award achievement: ${awardResult.message}`
        };
      }
      
      // Verify achievement was awarded
      const { data: userAchievement, error: verifyError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .maybeSingle();
        
      if (verifyError) {
        throw new Error(`Error verifying achievement: ${verifyError.message}`);
      }
      
      return {
        success: !!userAchievement,
        message: userAchievement 
          ? `Successfully awarded ${testCategory} category achievement` 
          : 'Failed to award achievement'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});
