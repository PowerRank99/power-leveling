
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class LevelChecker {
  static async checkLevelAchievements(
    userId: string, 
    unlockedIds: string[], 
    eligibleAchievements: any[]
  ): Promise<void> {
    try {
      // Get user's current level from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) {
        console.error('Error fetching profile level:', profileError);
        return;
      }

      console.log('Checking level achievements for level:', profile.level);
      
      // Filter level-based achievements
      const levelAchievements = eligibleAchievements.filter(
        achievement => achievement.requirements?.level_required
      );
      
      // Check each achievement
      for (const achievement of levelAchievements) {
        if (unlockedIds.includes(achievement.id)) continue;
        
        const requiredLevel = achievement.requirements.level_required;
        
        if (profile.level >= requiredLevel) {
          console.log(`Awarding level achievement ${achievement.name} for level ${requiredLevel}`);
          
          await AchievementAwardService.awardAchievement(
            userId,
            achievement.id,
            achievement.name,
            achievement.description,
            achievement.xp_reward,
            achievement.points
          );
        }
      }
    } catch (error) {
      console.error('Error in checkLevelAchievements:', error);
    }
  }
}
