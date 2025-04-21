
import { supabase } from '@/integrations/supabase/client';
import { AchievementAwardService } from '../AchievementAwardService';

export class PowerDayChecker {
  static async checkPowerDayAchievement(
    userId: string,
    unlockedIds: string[],
    achievements: any[]
  ) {
    try {
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
        .select('id')
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
        totalPowerDays
      });
      
      // Check for power day achievement
      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement.id)) continue;
        
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
        
        // Debug log achievement requirements
        console.log('Checking Power Day achievement:', {
          name: achievement.name,
          requirements,
          current: totalPowerDays
        });
        
        if (requirements?.power_days && totalPowerDays >= requirements.power_days) {
          console.log('Unlocking Power Day achievement:', {
            name: achievement.name,
            required: requirements.power_days,
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
