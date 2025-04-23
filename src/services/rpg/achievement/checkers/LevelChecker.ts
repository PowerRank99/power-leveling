
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

      console.log('Checking level achievements for user', userId);
      console.log('Current user level:', profile.level);
      
      // Filter level-based achievements
      const levelAchievements = eligibleAchievements.filter(
        achievement => {
          if (!achievement.requirements) return false;
          
          const requirements = achievement.requirements;
          return typeof requirements === 'object' && 
                 !Array.isArray(requirements) && 
                 'level_required' in requirements;
        }
      );
      
      console.log('Found level achievements:', levelAchievements.length);
      
      // Check each achievement
      for (const achievement of levelAchievements) {
        if (unlockedIds.includes(achievement.id)) {
          console.log(`Achievement ${achievement.name} already unlocked, skipping`);
          continue;
        }
        
        const requiredLevel = achievement.requirements.level_required;
        console.log(`Checking ${achievement.name}: Required level ${requiredLevel}, User level ${profile.level}`);
        
        if (profile.level >= requiredLevel) {
          console.log(`Awarding achievement ${achievement.name} for reaching level ${requiredLevel}`);
          
          const result = await AchievementAwardService.awardAchievement(
            userId,
            achievement.id,
            achievement.name,
            achievement.description,
            achievement.xp_reward,
            achievement.points
          );
          
          console.log(`Award result for ${achievement.name}: ${result ? 'Success' : 'Failed'}`);
        }
      }
    } catch (error) {
      console.error('Error in checkLevelAchievements:', error);
    }
  }
}
