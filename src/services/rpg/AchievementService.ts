
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class AchievementService {
  /**
   * Checks for and awards achievements based on user progress
   */
  static async checkAchievements(userId: string): Promise<void> {
    try {
      if (!userId) {
        console.error('No userId provided to checkAchievements');
        return;
      }
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('workouts_count, streak')
        .eq('id', userId)
        .single();
        
      if (!profile) {
        console.error('No profile found for user', userId);
        return;
      }
      
      // Get all achievements user doesn't have yet
      const { data: unlockedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
        
      const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      
      // Get all eligible achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.length > 0 ? unlockedIds.join(',') : 'null'})`);
        
      if (!achievements || achievements.length === 0) {
        return;
      }
      
      // Check each achievement
      for (const achievement of achievements) {
        const requirements = achievement.requirements;
        
        // Check workout count achievements
        if (requirements.workouts_count && profile.workouts_count >= requirements.workouts_count) {
          await this.awardAchievement(userId, achievement.id, achievement.name, achievement.xp_reward);
        }
        
        // Check streak achievements
        if (requirements.streak_days && profile.streak >= requirements.streak_days) {
          await this.awardAchievement(userId, achievement.id, achievement.name, achievement.xp_reward);
        }
        
        // Additional achievement types can be added here
      }
    } catch (error) {
      console.error('Error in checkAchievements:', error);
    }
  }
  
  private static async awardAchievement(
    userId: string, 
    achievementId: string, 
    achievementName: string,
    xpReward: number
  ): Promise<void> {
    try {
      // Record the achievement
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId
        });
        
      if (error) {
        // If there's a unique constraint violation, the user already has this achievement
        if (error.code !== '23505') { // PostgreSQL unique violation code
          console.error('Error awarding achievement:', error);
        }
        return;
      }
      
      // Update the achievements count
      await supabase
        .from('profiles')
        .update({ 
          achievements_count: supabase.rpc('increment', { x: 1 }),
          xp: supabase.rpc('increment', { x: xpReward })
        })
        .eq('id', userId);
        
      // Notify user
      toast.success(`🏆 Conquista Desbloqueada!`, {
        description: `${achievementName} (+${xpReward} XP)`
      });
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  }
}
