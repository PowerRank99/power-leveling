
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';
import { AchievementCategory } from '@/types/achievementTypes';

export class RankAAchievementChecker {
  static async checkAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Fetch Rank A achievements
        const { data: achievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('rank', 'A')
          .eq('category', AchievementCategory.RANK_A);
          
        if (achievementsError) throw achievementsError;
        
        const achievementChecks: string[] = [];
        
        if (achievements) {
          for (const achievement of achievements) {
            // Advanced achievement requirements
            if (achievement.requirements?.workout_count && workoutStats.totalCount >= achievement.requirements.workout_count) {
              achievementChecks.push(achievement.id);
            }
            
            // Elite streak requirements
            if (achievement.requirements?.streak_days && userProfile.streak >= achievement.requirements.streak_days) {
              achievementChecks.push(achievement.id);
            }
            
            // High level requirements
            if (achievement.requirements?.level && userProfile.level >= achievement.requirements.level) {
              achievementChecks.push(achievement.id);
            }
            
            // Significant achievement points requirements
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
      'CHECK_RANK_A_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
