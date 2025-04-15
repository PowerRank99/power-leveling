
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';

export class RankEAchievementChecker {
  static async checkAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Fetch Rank E achievements
        const { data: achievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements, requirement_type')
          .eq('rank', 'E')
          .eq('category', 'workout');
          
        if (achievementsError) throw achievementsError;
        
        const achievementChecks: string[] = [];
        
        if (achievements) {
          achievements.forEach(achievement => {
            if (achievement.requirement_type === 'total_count' && 
                workoutStats.totalCount >= (achievement.requirements?.total_count || 0)) {
              achievementChecks.push(achievement.id);
            }
            
            if (achievement.requirement_type === 'weekly_count' && 
                workoutStats.weeklyCount >= (achievement.requirements?.weekly_count || 0)) {
              achievementChecks.push(achievement.id);
            }
          });
        }
        
        // Check for first guild achievement
        const { data: guildAchievement, error: guildAchievementError } = await supabase
          .from('achievements')
          .select('id')
          .eq('rank', 'E')
          .eq('category', 'guild')
          .eq('requirement_type', 'first_guild')
          .single();
          
        if (!guildAchievementError && guildAchievement) {
          const { count: guildCount } = await supabase
            .from('guild_members')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
            
          if (guildCount && guildCount > 0) {
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
