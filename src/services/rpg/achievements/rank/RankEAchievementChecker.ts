
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';
import { AchievementCategory } from '@/types/achievementTypes';

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
          .select('id, requirements')
          .eq('rank', 'E')
          .eq('category', AchievementCategory.RANK_E);
          
        if (achievementsError) throw achievementsError;
        
        const achievementChecks: string[] = [];
        
        if (achievements) {
          for (const achievement of achievements) {
            if (achievement.requirements?.total_count && 
                workoutStats.totalCount >= achievement.requirements.total_count) {
              achievementChecks.push(achievement.id);
            }
            
            if (achievement.requirements?.weekly_count && 
                workoutStats.weeklyCount >= achievement.requirements.weekly_count) {
              achievementChecks.push(achievement.id);
            }
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
