
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class PowerDayChecker {
  static async checkPowerDayAchievement(
    userId: string,
    unlockedIds: string[],
    achievements: any[]
  ) {
    try {
      console.log('Checking power day achievements for user:', userId);
      
      // Get power day usage to check if user has activated power days
      const { data: powerDayData, error: powerDayError } = await supabase
        .from('power_day_usage')
        .select('id')
        .eq('user_id', userId);
        
      if (powerDayError) {
        console.error('Error fetching power day usage:', powerDayError);
        return;
      }

      // Also check manual workouts that are marked as power day
      const { data: manualPowerDays, error: manualError } = await supabase
        .from('manual_workouts')
        .select('id, workout_date')
        .eq('user_id', userId)
        .eq('is_power_day', true);
      
      if (manualError) {
        console.error('Error fetching manual power day workouts:', manualError);
        return;
      }
      
      // Combine both sources
      const totalPowerDays = (powerDayData?.length || 0) + (manualPowerDays?.length || 0);
      
      // Debug logging
      console.log('Power Day Check:', {
        regularPowerDays: powerDayData?.length || 0,
        manualPowerDays: manualPowerDays?.length || 0,
        totalPowerDays,
        manualPowerDaysDetails: manualPowerDays
      });
      
      // Check for power day achievement
      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement.id)) {
          console.log(`Achievement ${achievement.name} already unlocked, skipping`);
          continue;
        }
        
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
        
        // Debug log achievement requirements
        console.log('Checking Power Day achievement:', {
          name: achievement.name,
          requirements,
          current: totalPowerDays
        });
        
        // Check both fields for requirements - power_days and power_day_count
        const requiredPowerDays = requirements?.power_days || requirements?.power_day_count;
        
        if (requiredPowerDays && totalPowerDays >= requiredPowerDays) {
          console.log('Unlocking Power Day achievement:', {
            name: achievement.name,
            required: requiredPowerDays,
            current: totalPowerDays
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
      console.error('Error in checkPowerDayAchievement:', error);
    }
  }
}
