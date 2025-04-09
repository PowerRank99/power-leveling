
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { achievementPopupStore } from '@/stores/achievementPopupStore';

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
        // Parse the requirements JSON to access its properties safely
        const requirements = typeof achievement.requirements === 'string' 
          ? JSON.parse(achievement.requirements) 
          : achievement.requirements;
        
        let achievementUnlocked = false;
        
        // Check workout count achievements
        if (requirements && 
            'workouts_count' in requirements && 
            profile.workouts_count >= requirements.workouts_count) {
          await this.awardAchievement(userId, achievement.id, achievement.name, achievement.description, achievement.xp_reward);
          achievementUnlocked = true;
        }
        
        // Check streak achievements
        if (!achievementUnlocked && 
            requirements && 
            'streak_days' in requirements && 
            profile.streak >= requirements.streak_days) {
          await this.awardAchievement(userId, achievement.id, achievement.name, achievement.description, achievement.xp_reward);
          achievementUnlocked = true;
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
    achievementDescription: string,
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
      
      // Update the achievements count and XP
      // Using a transaction to ensure both updates succeed or fail together
      // Use type assertion to make TypeScript happy with our custom RPC function
      await supabase.rpc(
        'increment_achievement_and_xp' as any, 
        {
          user_id: userId,
          xp_amount: xpReward
        }
      );
      
      // Show achievement popup - fixed to properly use the Zustand store
      const { showAchievement } = achievementPopupStore.getState();
      showAchievement({
        title: achievementName,
        description: achievementDescription,
        xpReward: xpReward,
        bonusText: "Excede o limite diário"
      });
        
      // Also show toast notification
      toast.success(`🏆 Conquista Desbloqueada!`, {
        description: `${achievementName} (+${xpReward} XP)`
      });
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  }
}
