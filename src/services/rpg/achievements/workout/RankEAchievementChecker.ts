
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';

/**
 * Checker specifically for Rank E (basic starter) workout achievements
 */
export class RankEAchievementChecker {
  /**
   * Check Rank E achievements (basic starter achievements)
   */
  static async checkAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const achievementChecks: string[] = [];
        
        // First workout achievement
        if (workoutStats.totalCount >= 1) {
          achievementChecks.push('first-workout');
        }
        
        // 3 workouts in a week
        if (workoutStats.weeklyCount >= 3) {
          achievementChecks.push('weekly-3');
        }
        
        // 7 total workouts
        if (workoutStats.totalCount >= 7) {
          achievementChecks.push('total-7');
        }
        
        // First guild joined - need to check guilds
        const { count: guildCount, error: guildError } = await supabase
          .from('guild_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (!guildError && guildCount && guildCount > 0) {
          achievementChecks.push('first-guild');
        }
        
        if (achievementChecks.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
        }
      },
      'CHECK_RANK_E_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
