
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';

/**
 * Checker specifically for Rank D (moderate difficulty) workout achievements
 */
export class RankDAchievementChecker {
  /**
   * Check Rank D achievements (moderate difficulty)
   */
  static async checkAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const achievementChecks: string[] = [];
        
        // 10 total workouts
        if (workoutStats.totalCount >= 10) {
          achievementChecks.push('total-10');
        }
        
        // Join 3 or more guilds - need to check guilds
        const { count: guildCount, error: guildError } = await supabase
          .from('guild_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (!guildError && guildCount && guildCount >= 3) {
          achievementChecks.push('multiple-guilds');
        }
        
        if (achievementChecks.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
        }
      },
      'CHECK_RANK_D_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
