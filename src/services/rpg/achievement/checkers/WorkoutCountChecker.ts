
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class WorkoutCountChecker {
  static async checkWorkoutAchievements(
    userId: string,
    profile: { workouts_count: number },
    unlockedIds: string[],
    achievements: any[]
  ) {
    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) continue;
      
      const requirements = typeof achievement.requirements === 'string' 
        ? JSON.parse(achievement.requirements) 
        : achievement.requirements;
      
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
    }
  }
}
