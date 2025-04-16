
import { scenarioRunner } from './index';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

// Register a basic streak scenario
scenarioRunner.registerScenario({
  id: 'three-day-streak',
  name: 'Three Day Streak Achievement',
  description: 'Tests the achievement for maintaining a 3-day workout streak',
  tags: ['streak', 'basic', 'rank-e'],
  achievementTypes: ['streak'],
  
  async execute(userId: string) {
    try {
      // Set 3-day streak
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          streak: 3,
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
      
      // Find 3-day streak achievement
      const { data: achievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('category', 'streak')
        .eq('requirements->streak', 3)
        .maybeSingle();
      
      if (!achievement) {
        return {
          success: false,
          message: 'Three-day streak achievement not found in database'
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
          ? 'Successfully awarded 3-day streak achievement' 
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

// Register a week streak scenario
scenarioRunner.registerScenario({
  id: 'week-streak',
  name: 'Week-long Streak Achievement',
  description: 'Tests the achievement for maintaining a 7-day workout streak',
  tags: ['streak', 'intermediate', 'rank-d'],
  achievementTypes: ['streak'],
  
  async execute(userId: string) {
    try {
      // Set 7-day streak
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          streak: 7,
          last_workout_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
      
      // Find 7-day streak achievement
      const { data: achievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('category', 'streak')
        .eq('requirements->streak', 7)
        .maybeSingle();
      
      if (!achievement) {
        return {
          success: false,
          message: 'Seven-day streak achievement not found in database'
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
