
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';
import { AchievementCategory } from '@/types/achievementTypes';

export class RankDAchievementChecker {
  static async checkAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Fetch Rank D achievements
        const { data: achievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('rank', 'D')
          .eq('category', AchievementCategory.RANK_D);
          
        if (achievementsError) throw achievementsError;
        
        const achievementChecks: string[] = [];
        
        if (achievements) {
          for (const achievement of achievements) {
            const requirements = achievement.requirements;
            
            if (requirements.type === 'total_count' && 
                workoutStats.totalCount >= requirements.count) {
              achievementChecks.push(achievement.id);
            }
            
            if (requirements.type === 'streak' && 
                userProfile.streak >= requirements.days) {
              achievementChecks.push(achievement.id);
            }
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
