
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from './achievement/AchievementAwardService';
import { toast } from 'sonner';

export class AchievementDebug {
  static async debugLevelAchievement(userId: string, achievementName: string = 'Herói em Ascensão'): Promise<void> {
    try {
      console.group(`Debug for achievement: ${achievementName}`);
      
      // 1. Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('level, name')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        console.groupEnd();
        return;
      }
      
      console.log(`User ${profile.name} is level ${profile.level}`);
      
      // 2. Get the achievement
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('name', achievementName)
        .single();
        
      if (achievementError || !achievement) {
        console.error(`Achievement "${achievementName}" not found:`, achievementError);
        console.groupEnd();
        return;
      }
      
      console.log('Achievement found:', achievement);
      console.log('Requirements:', achievement.requirements);
      
      // 3. Check if already awarded
      const { data: existingAward, error: awardError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .maybeSingle();
        
      if (awardError) {
        console.error('Error checking existing award:', awardError);
      }
      
      console.log('Already awarded?', !!existingAward);
      
      // 4. Check if conditions are met
      const requiredLevel = achievement.requirements?.level_required;
      if (!requiredLevel) {
        console.error('No level requirement found in achievement');
        console.groupEnd();
        return;
      }
      
      console.log(`Required level: ${requiredLevel}, User level: ${profile.level}`);
      const meetsRequirements = profile.level >= requiredLevel;
      console.log('Meets requirements?', meetsRequirements);
      
      // 5. Award manually if needed
      if (!existingAward && meetsRequirements) {
        console.log('Attempting to manually award achievement...');
        
        const awarded = await AchievementAwardService.awardAchievement(
          userId,
          achievement.id,
          achievement.name,
          achievement.description,
          achievement.xp_reward,
          achievement.points
        );
        
        console.log('Manual award result:', awarded);
        if (awarded) {
          toast.success(`Achievement "${achievement.name}" awarded!`);
        } else {
          toast.error('Failed to award achievement');
        }
      } else if (existingAward) {
        console.log('Achievement already awarded, no action needed');
        toast.info('Achievement was already unlocked');
      } else {
        console.log('Requirements not met, cannot award');
        toast.error(`Requirements not met: level ${profile.level}/${requiredLevel}`);
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('Debug error:', error);
      console.groupEnd();
    }
  }
}
