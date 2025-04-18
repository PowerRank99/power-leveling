
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from './AchievementAwardService';

export class FirstAchievementService {
  /**
   * Try to award "Primeiro Treino" achievement for a user
   */
  static async tryAwardFirstWorkoutAchievement(userId: string): Promise<boolean> {
    try {
      // First check if the user already has the achievement
      const { data: existingAchievement, error: checkError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)
        .eq('achievement_id', '1c7a25a5-7ab0-4c55-b74a-c33d823e38a5') // ID of Primeiro Treino
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for first workout achievement:', checkError);
        return false;
      }
      
      // If user already has the achievement, no need to proceed
      if (existingAchievement) {
        return true;
      }
      
      // Get the achievement details
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', '1c7a25a5-7ab0-4c55-b74a-c33d823e38a5')
        .single();
        
      if (achievementError) {
        console.error('Error fetching first workout achievement:', achievementError);
        return false;
      }

      // Award the achievement
      const result = await AchievementAwardService.awardAchievement(
        userId,
        achievement.id,
        achievement.name,
        achievement.description,
        achievement.xp_reward,
        achievement.points
      );
      
      return result;
    } catch (error) {
      console.error('Error in tryAwardFirstWorkoutAchievement:', error);
      return false;
    }
  }
  
  /**
   * Try to award first manual workout achievement
   */
  static async tryAwardFirstManualWorkoutAchievement(userId: string): Promise<boolean> {
    try {
      // Find the achievement with requirement for first manual workout
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('string_id', 'esporte-de-primeira');
        
      if (achievementsError || !achievements || achievements.length === 0) {
        console.error('Error fetching first manual workout achievement:', achievementsError);
        return false;
      }
      
      const achievement = achievements[0];
      
      // Check if user already has this achievement
      const { data: existingAchievement, error: checkError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for first manual workout achievement:', checkError);
        return false;
      }
      
      // If user already has the achievement, no need to proceed
      if (existingAchievement) {
        return true;
      }
      
      // Award the achievement
      const result = await AchievementAwardService.awardAchievement(
        userId,
        achievement.id,
        achievement.name,
        achievement.description,
        achievement.xp_reward,
        achievement.points
      );
      
      return result;
    } catch (error) {
      console.error('Error in tryAwardFirstManualWorkoutAchievement:', error);
      return false;
    }
  }
}
