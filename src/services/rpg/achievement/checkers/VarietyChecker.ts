
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class VarietyChecker {
  static async checkVarietyAchievements(
    userId: string,
    unlockedIds: string[],
    achievements: any[]
  ) {
    // Check current week's variety
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const { data: weekVarieties } = await supabase
      .from('workout_varieties')
      .select('exercise_types')
      .eq('user_id', userId)
      .gte('workout_date', startOfWeek.toISOString().split('T')[0]);
      
    const uniqueTypes = new Set<string>();
    weekVarieties?.forEach(v => v.exercise_types?.forEach(t => uniqueTypes.add(t)));
    
    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) continue;
      
      const requirements = typeof achievement.requirements === 'string'
        ? JSON.parse(achievement.requirements)
        : achievement.requirements;
      
      if (requirements?.unique_exercise_types && 
          uniqueTypes.size >= requirements.unique_exercise_types) {
        console.log('Unlocking variety achievement:', {
          name: achievement.name,
          required: requirements.unique_exercise_types,
          current: uniqueTypes.size
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
