
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class WorkoutCountChecker {
  static async checkWorkoutAchievements(
    userId: string,
    profile: { workouts_count: number },
    unlockedIds: string[],
    achievements: any[]
  ) {
    // Get manual workouts count
    const { count: manualWorkoutsCount } = await supabase
      .from('manual_workouts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) continue;
      
      const requirements = typeof achievement.requirements === 'string' 
        ? JSON.parse(achievement.requirements) 
        : achievement.requirements;
      
      // Check total workouts count achievements
      if (requirements?.workouts_count && 
          profile.workouts_count >= requirements.workouts_count) {
        console.log('Unlocking workout count achievement:', {
          name: achievement.name,
          required: requirements.workouts_count,
          current: profile.workouts_count
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

      // Check manual workouts count achievements
      if (requirements?.manual_workouts_count && 
          manualWorkoutsCount >= requirements.manual_workouts_count) {
        console.log('Unlocking manual workout count achievement:', {
          name: achievement.name,
          required: requirements.manual_workouts_count,
          current: manualWorkoutsCount
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
  }
}
