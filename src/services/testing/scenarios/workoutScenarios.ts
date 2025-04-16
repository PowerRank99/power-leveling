
import { scenarioRunner } from './index';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

// Register a first workout scenario
scenarioRunner.registerScenario({
  id: 'first-workout',
  name: 'First Workout Achievement',
  description: 'Tests the achievement for completing your first workout',
  tags: ['workout', 'basic', 'rank-e'],
  achievementTypes: ['workout', 'milestone'],
  
  async execute(userId: string) {
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
        throw new Error(`Error creating workout: ${workoutError?.message}`);
      }
      
      // Create a workout set
      const { error: setError } = await supabase
        .from('workout_sets')
        .insert({
          workout_id: workout.id,
          exercise_id: 'sample-exercise-id', // This would be a real exercise ID in production
          set_order: 1,
          weight: 50,
          reps: 10,
          completed: true,
          completed_at: new Date().toISOString()
        });
        
      if (setError) {
        throw new Error(`Error creating workout set: ${setError.message}`);
      }
      
      // Update profile workout count
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          workouts_count: 1,
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
      
      // Check for "Primeiro Treino" achievement
      const { data: achievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('string_id', 'primeiro-treino')
        .maybeSingle();
      
      if (!achievement) {
        return {
          success: false,
          message: 'First workout achievement not found in database'
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
          ? 'Successfully awarded first workout achievement' 
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

// Register a workout streak scenario
scenarioRunner.registerScenario({
  id: 'workout-streak',
  name: 'Workout Streak Achievement',
  description: 'Tests achievements related to maintaining a workout streak',
  tags: ['workout', 'streak', 'rank-d'],
  achievementTypes: ['streak'],
  
  async execute(userId: string) {
    try {
      // Update profile with streak
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          streak: 7, // 7-day streak
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (profileError) {
        throw new Error(`Error updating profile streak: ${profileError.message}`);
      }
      
      // Check for 7-day streak achievement
      const { data: achievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('category', 'streak')
        .eq('requirements', JSON.stringify({ streak: 7 }))
        .maybeSingle();
      
      if (!achievement) {
        return {
          success: false,
          message: 'Streak achievement not found in database'
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
          ? 'Successfully awarded 7-day streak achievement' 
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
