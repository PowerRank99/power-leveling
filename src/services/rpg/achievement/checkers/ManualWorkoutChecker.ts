
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class ManualWorkoutChecker {
  static async checkManualWorkoutAchievements(
    userId: string,
    unlockedIds: string[],
    achievements: any[]
  ) {
    try {
      // Count all manual workouts for this user
      const { count: manualCount, error: countError } = await supabase
        .from('manual_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (countError) {
        console.error('Error counting manual workouts:', countError);
        return;
      }
      
      // Debug logging
      console.log('Manual workouts count:', manualCount);
      
      // Check for manual workout achievements
      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement.id)) continue;
        
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
        
        if (requirements?.manual_workouts && 
            manualCount >= requirements.manual_workouts) {
          console.log('Unlocking manual workout achievement:', {
            name: achievement.name,
            required: requirements.manual_workouts,
            current: manualCount
          });
          
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
      console.error('Error in checkManualWorkoutAchievements:', error);
    }
  }
}
