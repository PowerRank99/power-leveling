
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
        // Fetch Rank D achievements from database
        const { data: rankDAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('rank', 'D')
          .eq('category', 'workout');
          
        if (achievementsError) throw achievementsError;
        
        const achievementChecks: string[] = [];
        
        // Check each achievement's requirements
        if (rankDAchievements) {
          rankDAchievements.forEach(achievement => {
            // Check for total workout count requirement
            if (achievement.requirements?.total_count && workoutStats.totalCount >= achievement.requirements.total_count) {
              achievementChecks.push(achievement.id);
            }
          });
        }
        
        // Join 3 or more guilds - need to check guilds
        const { count: guildCount, error: guildError } = await supabase
          .from('guild_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (!guildError && guildCount && guildCount >= 3) {
          // Fetch multiple guilds achievement
          const { data: multipleGuildsAchievement } = await supabase
            .from('achievements')
            .select('id')
            .eq('rank', 'D')
            .eq('category', 'guild')
            .eq('requirements->guild_count', 3)
            .single();
            
          if (multipleGuildsAchievement) {
            achievementChecks.push(multipleGuildsAchievement.id);
          }
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
