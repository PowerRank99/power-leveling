
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';
import { AchievementCategory } from '@/types/achievementTypes';

export class RankSAchievementChecker {
  static async checkAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Fetch Rank S achievements
        const { data: achievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('rank', 'S')
          .eq('category', AchievementCategory.RANK_S);
          
        if (achievementsError) throw achievementsError;
        
        const achievementChecks: string[] = [];
        
        if (achievements) {
          for (const achievement of achievements) {
            // Legendary achievement requirements
            if (achievement.requirements?.workout_count && workoutStats.totalCount >= achievement.requirements.workout_count) {
              achievementChecks.push(achievement.id);
            }
            
            // Epic streak requirements
            if (achievement.requirements?.streak_days && userProfile.streak >= achievement.requirements.streak_days) {
              achievementChecks.push(achievement.id);
            }
            
            // Mastery level requirements
            if (achievement.requirements?.level && userProfile.level >= achievement.requirements.level) {
              achievementChecks.push(achievement.id);
            }
            
            // Legendary achievement points requirements
            if (achievement.requirements?.achievement_points && 
                userProfile.achievement_points >= achievement.requirements.achievement_points) {
              achievementChecks.push(achievement.id);
            }
          }
        }
        
        if (achievementChecks.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
        }
      },
      'CHECK_RANK_S_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
