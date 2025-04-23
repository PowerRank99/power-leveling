
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
    
    // Get user's profile to identify Pierri Bruno
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();
      
    const isTargetUser = userProfile?.name === 'Pierri Bruno';
    if (isTargetUser) {
      console.log('🎯 Found target user Pierri Bruno! User ID:', userId);
    }
    
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
    
    weekVarieties?.forEach(v => v.exercise_types?.forEach(t => weeklyUniqueTypes.add(t)));
    allVarieties?.forEach(v => v.exercise_types?.forEach(t => allTimeUniqueTypes.add(t)));
    
    if (isTargetUser) {
      console.log('👤 Pierri Bruno\'s workout varieties:');
      console.log('All-time unique types:', Array.from(allTimeUniqueTypes));
      console.log('Weekly unique types:', Array.from(weeklyUniqueTypes));
    }
    
    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) {
        if (isTargetUser && achievement.name === 'Combo Fitness') {
          console.log('⚠️ Combo Fitness is already unlocked, skipping!', achievement.id);
        }
        continue;
      }
      
      const requirements = typeof achievement.requirements === 'string'
        ? JSON.parse(achievement.requirements)
        : achievement.requirements;
        
      if (isTargetUser && achievement.name === 'Combo Fitness') {
        console.log('🏅 Debugging COMBO FITNESS achievement for Pierri Bruno:');
        console.log('Achievement data:', achievement);
        console.log('Requirements:', requirements);
      }
        
      // Handle variety combo requirements
      if (requirements?.variety_combo) {
        const requiredTypes = requirements.variety_combo;
        const isComboFitness = achievement.name === 'Combo Fitness';
        
        // Use all-time varieties for Combo Fitness, weekly varieties for others
        const typesToCheck = isComboFitness ? allTimeUniqueTypes : weeklyUniqueTypes;
        
        console.log(`🏆 Checking ${isComboFitness ? 'All-Time' : 'Weekly'} Variety Achievement:`, {
          name: achievement.name,
          required: requiredTypes,
          current: Array.from(typesToCheck)
        });
        
        const hasAllRequired = requiredTypes.every(
          (type: string) => typesToCheck.has(type)
        );
        
        if (isTargetUser && achievement.name === 'Combo Fitness') {
          console.log('Required types check result:');
          requiredTypes.forEach((type: string) => {
            console.log(`- ${type}: ${typesToCheck.has(type) ? '✅ Found' : '❌ Missing'}`);
          });
          console.log('Final result - Has all required:', hasAllRequired);
        }
        
        if (hasAllRequired) {
          console.log('✅ Achievement Unlocked:', {
            name: achievement.name,
            required: requiredTypes,
            current: Array.from(typesToCheck)
          });
          
          try {
            const awarded = await this.awardAchievement(userId, achievement);
            
            if (isTargetUser && achievement.name === 'Combo Fitness') {
              console.log('Award attempt result:', awarded);
            }
          } catch (error) {
            console.error('Error awarding achievement:', error);
          }
        } else {
          console.log('❌ Achievement Not Unlocked (Missing Types):', {
            name: achievement.name,
            missing: requiredTypes.filter((t: string) => !typesToCheck.has(t))
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
