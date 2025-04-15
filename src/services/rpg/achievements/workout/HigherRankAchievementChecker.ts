
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';
import { supabase } from '@/integrations/supabase/client';

/**
 * Checker specifically for higher rank (C, B, A, S) workout achievements
 */
export class HigherRankAchievementChecker {
  /**
   * Check Rank C achievements (intermediate difficulty)
   */
  static async checkRankCAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Fetch Rank C achievements from database
        const { data: rankCAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('rank', 'C')
          .eq('category', 'workout');
          
        if (achievementsError) throw achievementsError;
        
        const achievementChecks: string[] = [];
        
        // Check each achievement's requirements
        if (rankCAchievements) {
          rankCAchievements.forEach(achievement => {
            // Check for total workout count requirement
            if (achievement.requirements?.total_count && workoutStats.totalCount >= achievement.requirements.total_count) {
              achievementChecks.push(achievement.id);
            }
          });
        }
        
        if (achievementChecks.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
        }
      },
      'CHECK_RANK_C_ACHIEVEMENTS',
      { showToast: false }
    );
  }
  
  /**
   * Check higher rank achievements (B, A, S)
   */
  static async checkHigherRankAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Fetch higher rank achievements (B, A, S) from database
        const { data: higherRankAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, rank, requirements')
          .in('rank', ['B', 'A', 'S'])
          .eq('category', 'workout');
          
        if (achievementsError) throw achievementsError;
        
        const achievementChecks: string[] = [];
        
        // Check each achievement's requirements
        if (higherRankAchievements) {
          higherRankAchievements.forEach(achievement => {
            // Check for total workout count requirement
            if (achievement.requirements?.total_count && workoutStats.totalCount >= achievement.requirements.total_count) {
              achievementChecks.push(achievement.id);
            }
          });
        }
        
        // Check for streak achievements (legendary)
        if (userProfile?.streak) {
          const { data: streakAchievements } = await supabase
            .from('achievements')
            .select('id, requirements')
            .eq('category', 'streak')
            .order('requirements->days', { ascending: true });
            
          if (streakAchievements) {
            streakAchievements.forEach(achievement => {
              const requiredDays = achievement.requirements?.days || 0;
              if (userProfile.streak >= requiredDays && requiredDays >= 100) {
                achievementChecks.push(achievement.id);
              }
            });
          }
        }
        
        if (achievementChecks.length > 0) {
          await AchievementService.checkAndAwardAchievements(userId, achievementChecks);
        }
      },
      'CHECK_HIGHER_RANK_ACHIEVEMENTS',
      { showToast: false }
    );
  }
}
