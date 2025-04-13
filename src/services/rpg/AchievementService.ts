
import { supabase } from '@/integrations/supabase/client';
import { XPService } from './XPService';
import { toast } from 'sonner';
import { TransactionService } from '../common/TransactionService';
import { ServiceResponse, ErrorHandlingService } from '../common/ErrorHandlingService';
import { AchievementAwardService } from './achievements/AchievementAwardService';
import { AchievementFetchService } from './achievements/AchievementFetchService';

/**
 * Service for handling achievements
 */
export class AchievementService {
  /**
   * Award an achievement to a user
   * Delegates to AchievementAwardService
   */
  static async awardAchievement(userId: string, achievementId: string): Promise<ServiceResponse<boolean>> {
    return AchievementAwardService.awardAchievement(userId, achievementId);
  }
  
  /**
   * Check and award a batch of achievements at once
   * Delegates to AchievementAwardService
   */
  static async checkAndAwardAchievements(
    userId: string,
    achievementIds: string[]
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId || !achievementIds.length) return false;

        // Use AchievementAwardService to check and award achievements
        const result = await AchievementAwardService.checkAndAwardAchievements(userId, achievementIds);
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to check achievements');
        }
        
        // Get newly awarded achievements
        const newlyAwarded = result.data.successful;
        
        if (newlyAwarded?.length) {
          // Fetch full achievement details for awarded achievements
          const { data: details } = await supabase
            .from('achievements')
            .select('name, description, xp_reward, icon_name')
            .in('id', newlyAwarded);
          
          // Show toast for each new achievement
          details?.forEach(achievement => {
            toast.success('Conquista Desbloqueada! 🏆', {
              description: achievement.name
            });
            
            // Add XP from achievement if applicable
            if (achievement.xp_reward > 0) {
              XPService.awardXP(
                userId, 
                achievement.xp_reward, 
                'achievement',
                { achievementName: achievement.name }
              );
            }
          });
        }
        
        return newlyAwarded?.length > 0;
      },
      'CHECK_AND_AWARD_ACHIEVEMENTS',
      { showToast: false }
    );
  }
  
  /**
   * Get unlocked achievements for a user
   * Delegates to AchievementFetchService
   */
  static async getUnlockedAchievements(userId: string) {
    return AchievementFetchService.getUnlockedAchievements(userId);
  }
  
  /**
   * Get achievement stats for a user
   * Delegates to AchievementFetchService
   */
  static async getAchievementStats(userId: string) {
    return AchievementFetchService.getAchievementStats(userId);
  }
  
  /**
   * Check for achievements related to workouts
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string) {
    return AchievementFetchService.checkWorkoutAchievements(userId, workoutId);
  }
}
