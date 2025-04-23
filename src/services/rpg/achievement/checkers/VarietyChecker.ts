
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class VarietyChecker {
  static async checkVarietyAchievements(
    userId: string,
    unlockedIds: string[],
    achievements: any[]
  ) {
    // Get current week's variety
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
    
    console.log('Found exercise types for week:', Array.from(uniqueTypes));
    
    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) continue;
      
      const requirements = typeof achievement.requirements === 'string'
        ? JSON.parse(achievement.requirements)
        : achievement.requirements;
        
      // Check for unique exercise types requirement
      if (requirements?.unique_exercise_types && 
          uniqueTypes.size >= requirements.unique_exercise_types) {
        console.log('Achievement unlocked (unique types):', {
          name: achievement.name,
          required: requirements.unique_exercise_types,
          current: uniqueTypes.size
        });
        
        await this.awardAchievement(userId, achievement);
        continue;
      }
      
      // Check for variety combo requirement
      if (requirements?.variety_combo) {
        const requiredTypes = requirements.variety_combo;
        console.log('Checking variety combo:', {
          name: achievement.name,
          required: requiredTypes,
          current: Array.from(uniqueTypes)
        });
        
        const hasAllRequired = requiredTypes.every(
          (type: string) => uniqueTypes.has(type)
        );
        
        if (hasAllRequired) {
          console.log('Achievement unlocked (variety combo):', {
            name: achievement.name,
            required: requiredTypes
          });
          
          await this.awardAchievement(userId, achievement);
        } else {
          console.log('Missing some required types:', {
            name: achievement.name,
            missing: requiredTypes.filter((t: string) => !uniqueTypes.has(t))
          });
        }
      }
    }
  }
  
  private static async awardAchievement(userId: string, achievement: any) {
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
