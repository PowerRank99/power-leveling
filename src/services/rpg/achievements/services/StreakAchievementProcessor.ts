
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementProgressService } from '../AchievementProgressService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementService } from '@/services/rpg/AchievementService';

/**
 * Service for processing streak-related achievements
 */
export class StreakAchievementProcessor {
  /**
   * Process streak update for achievements
   */
  static async processStreakUpdate(userId: string, currentStreak: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Update progress for streak achievements
        await AchievementProgressService.updateStreakProgress(userId, currentStreak);
        
        // Get streak achievements from database
        const { data: achievements, error } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('category', 'streak')
          .order('requirements->days', { ascending: true });
          
        if (error) throw error;
        
        // Filter for achievements that match the current streak
        const unlockedAchievementIds = achievements
          .filter(achievement => {
            const requiredDays = achievement.requirements?.days || 0;
            return currentStreak >= requiredDays;
          })
          .map(achievement => achievement.id);
        
        // Award achievements
        if (unlockedAchievementIds.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, unlockedAchievementIds);
        }
        
        return unlockedAchievementIds;
      },
      'PROCESS_STREAK_UPDATE',
      { showToast: false }
    );
  }
}
