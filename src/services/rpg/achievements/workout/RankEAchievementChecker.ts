
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
        // Fetch Rank E achievements from database
        const { data: rankEAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('rank', 'E')
          .eq('category', 'workout');
          
        if (achievementsError) throw achievementsError;
        
        const achievementChecks: string[] = [];
        
        // Check each achievement's requirements
        if (rankEAchievements) {
          rankEAchievements.forEach(achievement => {
            // Check for total workout count requirement
            if (achievement.requirements?.total_count && workoutStats.totalCount >= achievement.requirements.total_count) {
              achievementChecks.push(achievement.id);
            }
            
            // Check for weekly workout count requirement
            if (achievement.requirements?.weekly_count && workoutStats.weeklyCount >= achievement.requirements.weekly_count) {
              achievementChecks.push(achievement.id);
            }
          });
        }
        
        // Check for first guild joined - special case
        const { count: guildCount, error: guildError } = await supabase
          .from('guild_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (!guildError && guildCount && guildCount > 0) {
          // Fetch guild-related achievement
          const { data: guildAchievement } = await supabase
            .from('achievements')
            .select('id')
            .eq('rank', 'E')
            .eq('category', 'guild')
            .single();
            
          if (guildAchievement) {
            achievementChecks.push(guildAchievement.id);
          }
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
