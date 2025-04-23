
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
    
    // Force check to see if Combo Fitness is already unlocked
    if (isTargetUser) {
      const { data: userAchievement } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)
        .eq('achievement_id', achievements.find(a => a.name === 'Combo Fitness')?.id);
      
      console.log('🔍 Checking if Combo Fitness already unlocked:', userAchievement);
    }
    
    const { data: weekVarieties } = await supabase
      .from('workout_varieties')
      .select('exercise_types, workout_date')
      .eq('user_id', userId)
      .gte('workout_date', startOfWeek.toISOString().split('T')[0]);
      
    const uniqueTypes = new Set<string>();
    weekVarieties?.forEach(v => v.exercise_types?.forEach(t => uniqueTypes.add(t)));
    
    console.log('🔍 Variety Achievement Debug: User ID', userId);
    console.log('Found exercise types for week:', Array.from(uniqueTypes));
    
    if (isTargetUser) {
      console.log('👤 Pierri Bruno\'s workout varieties:');
      console.log('Current week varieties:', weekVarieties);
      console.log('Unique workout types:', Array.from(uniqueTypes));
      console.log('Start of week date:', startOfWeek.toISOString().split('T')[0]);
      
      // Get all workout varieties for this user (not just current week)
      const { data: allVarieties } = await supabase
        .from('workout_varieties')
        .select('exercise_types, workout_date')
        .eq('user_id', userId)
        .order('workout_date', { ascending: false });
        
      console.log('All workout varieties:', allVarieties);
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
        
      // More detailed logging for Combo Fitness achievement
      if (achievement.name === 'Combo Fitness' && isTargetUser) {
        console.log('🏅 Debugging COMBO FITNESS achievement for Pierri Bruno:');
        console.log('Achievement data:', achievement);
        console.log('Requirements:', requirements);
        console.log('Achievement ID:', achievement.id);
        console.log('Unlocked IDs:', unlockedIds);
        console.log('Is achievement already unlocked?', unlockedIds.includes(achievement.id));
      }
        
      // Detailed logging for variety combo requirements
      if (requirements?.variety_combo) {
        const requiredTypes = requirements.variety_combo;
        console.log('🏆 Checking Variety Combo Achievement:', {
          name: achievement.name,
          required: requiredTypes,
          current: Array.from(uniqueTypes)
        });
        
        const hasAllRequired = requiredTypes.every(
          (type: string) => uniqueTypes.has(type)
        );
        
        if (isTargetUser && achievement.name === 'Combo Fitness') {
          console.log('Required types check result:');
          requiredTypes.forEach((type: string) => {
            console.log(`- ${type}: ${uniqueTypes.has(type) ? '✅ Found' : '❌ Missing'}`);
          });
          console.log('Final result - Has all required:', hasAllRequired);
        }
        
        if (hasAllRequired) {
          console.log('✅ Achievement Unlocked (Variety Combo):', {
            name: achievement.name,
            required: requiredTypes,
            current: Array.from(uniqueTypes)
          });
          
          // For Pierri Bruno, try both award methods
          if (isTargetUser && achievement.name === 'Combo Fitness') {
            console.log('🔥 Attempting to award Combo Fitness to Pierri Bruno directly');
            
            try {
              // First try direct method to award the achievement
              const awarded = await this.awardAchievement(userId, achievement);
              console.log('Direct award result:', awarded);
              
              // If direct method fails, try RPC as backup
              if (!awarded) {
                console.log('Direct award failed, trying RPC fallback');
                const { data, error } = await supabase.rpc(
                  'check_achievement_batch',
                  {
                    p_user_id: userId,
                    p_achievement_ids: [achievement.id]
                  }
                );
                
                console.log('RPC award result:', data, error);
              }
            } catch (error) {
              console.error('Error awarding achievement:', error);
            }
          } else {
            await this.awardAchievement(userId, achievement);
          }
        } else {
          console.log('❌ Achievement Not Unlocked (Missing Types):', {
            name: achievement.name,
            missing: requiredTypes.filter((t: string) => !uniqueTypes.has(t))
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
