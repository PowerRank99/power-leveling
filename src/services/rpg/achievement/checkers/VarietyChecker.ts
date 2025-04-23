
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class VarietyChecker {
  static async checkVarietyAchievements(
    userId: string,
    unlockedIds: string[],
    achievements: any[]
  ) {
    // Get current week's variety for weekly achievements
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get ALL workout varieties for cumulative achievements like Combo Fitness
    const { data: allVarieties } = await supabase
      .from('workout_varieties')
      .select('exercise_types')
      .eq('user_id', userId);
      
    // Get current week's varieties for weekly achievements
    const { data: weekVarieties } = await supabase
      .from('workout_varieties')
      .select('exercise_types')
      .eq('user_id', userId)
      .gte('workout_date', startOfWeek.toISOString().split('T')[0]);
      
    // Collect unique types for both timeframes
    const weeklyUniqueTypes = new Set<string>();
    const allTimeUniqueTypes = new Set<string>();
    
    weekVarieties?.forEach(v => {
      if (v.exercise_types) {
        v.exercise_types.forEach(t => weeklyUniqueTypes.add(t.toLowerCase()));
      }
    });
    
    allVarieties?.forEach(v => {
      if (v.exercise_types) {
        v.exercise_types.forEach(t => allTimeUniqueTypes.add(t.toLowerCase()));
      }
    });
    
    // Debug log for all users' workout varieties
    console.log('🏋️‍♂️ Checking workout varieties for user:', userId);
    console.log('All-time unique types:', Array.from(allTimeUniqueTypes));
    console.log('Weekly unique types:', Array.from(weeklyUniqueTypes));
    
    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) {
        continue;
      }
      
      const requirements = typeof achievement.requirements === 'string'
        ? JSON.parse(achievement.requirements)
        : achievement.requirements;
        
      // Handle variety combo requirements
      if (requirements?.variety_combo) {
        const requiredTypes = requirements.variety_combo.map((t: string) => t.toLowerCase());
        const isComboFitness = achievement.name === 'Combo Fitness';
        
        // Use all-time varieties for Combo Fitness, weekly varieties for others
        const typesToCheck = isComboFitness ? allTimeUniqueTypes : weeklyUniqueTypes;
        
        console.log(`🎯 Checking ${isComboFitness ? 'All-Time' : 'Weekly'} Variety Achievement:`, {
          name: achievement.name,
          required: requiredTypes,
          current: Array.from(typesToCheck)
        });
        
        const hasAllRequired = requiredTypes.every(
          (type: string) => Array.from(typesToCheck).some(t => t.includes(type.toLowerCase()))
        );
        
        if (hasAllRequired) {
          console.log('✅ Achievement requirements met:', {
            name: achievement.name,
            required: requiredTypes,
            current: Array.from(typesToCheck)
          });
          
          try {
            await this.awardAchievement(userId, achievement);
          } catch (error) {
            console.error('Error awarding achievement:', error);
          }
        } else {
          console.log('❌ Achievement requirements not met:', {
            name: achievement.name,
            missing: requiredTypes.filter(
              (t: string) => !Array.from(typesToCheck).some(ct => ct.includes(t.toLowerCase()))
            )
          });
        }
      }
    }
  }
  
  private static async awardAchievement(userId: string, achievement: any): Promise<boolean> {
    try {
      return await AchievementAwardService.awardAchievement(
        userId,
        achievement.id,
        achievement.name,
        achievement.description,
        achievement.xp_reward,
        achievement.points
      );
    } catch (error) {
      console.error('Error in award achievement:', error);
      return false;
    }
  }
}
