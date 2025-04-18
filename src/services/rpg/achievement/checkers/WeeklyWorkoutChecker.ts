
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class WeeklyWorkoutChecker {
  static async checkWeeklyAchievements(
    userId: string, 
    weeklyWorkoutsCount: number,
    unlockedIds: string[],
    achievements: any[]
  ) {
    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) continue;
      
      const requirements = typeof achievement.requirements === 'string'
        ? JSON.parse(achievement.requirements)
        : achievement.requirements;
      
      if (requirements?.workouts_in_week && 
          weeklyWorkoutsCount >= requirements.workouts_in_week) {
        console.log('Unlocking weekly workout achievement:', {
          name: achievement.name,
          required: requirements.workouts_in_week,
          current: weeklyWorkoutsCount
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
