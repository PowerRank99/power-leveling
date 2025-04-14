
import { supabase } from '@/integrations/supabase/client';
import { XPService } from './XPService';
import { toast } from 'sonner';
import { TransactionService } from '../common/TransactionService';
import { ServiceResponse, ErrorHandlingService, ErrorCategory, createErrorResponse, createSuccessResponse } from '../common/ErrorHandlingService';
import { AchievementAwardService } from './achievements/AchievementAwardService';
import { AchievementFetchService } from './achievements/AchievementFetchService';
import { Achievement } from '@/types/achievementTypes';

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
        const newlyAwarded = result.data?.successful;
        
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
   * Get all achievements
   * Delegates to AchievementFetchService
   */
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    return AchievementFetchService.getAllAchievements();
  }
  
  /**
   * Get unlocked achievements for a user
   * Delegates to AchievementFetchService
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return AchievementFetchService.getUnlockedAchievements(userId);
  }
  
  /**
   * Get achievement stats for a user
   * Delegates to AchievementFetchService
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<any>> {
    return AchievementFetchService.getAchievementStats(userId);
  }
  
  /**
   * Check for achievements related to workouts
   * Delegates to AchievementFetchService
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<ServiceResponse<any>> {
    return AchievementFetchService.checkWorkoutAchievements(userId, workoutId);
  }
  
  /**
   * Get achievement progress for a user
   * Delegates to AchievementFetchService
   */
  static async getAchievementProgress(userId: string, achievementId: string): Promise<ServiceResponse<any>> {
    return AchievementFetchService.getAchievementProgress(userId, achievementId);
  }
  
  /**
   * Get all achievement progress for a user
   * Delegates to AchievementFetchService
   */
  static async getAllAchievementProgress(userId: string): Promise<ServiceResponse<any>> {
    return AchievementFetchService.getAllAchievementProgress(userId);
  }
  
  /**
   * Create or update achievement progress
   */
  static async updateAchievementProgress(
    userId: string, 
    achievementId: string, 
    currentValue: number, 
    targetValue: number, 
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    try {
      const progressData = [{
        achievement_id: achievementId,
        current_value: currentValue,
        target_value: targetValue,
        is_complete: isComplete
      }];
      
      const { data, error } = await supabase
        .rpc('batch_update_achievement_progress', {
          p_user_id: userId,
          p_achievements: progressData
        });
        
      if (error) {
        return createErrorResponse(
          error.message, 
          `Failed to update achievement progress: ${error.message}`, 
          ErrorCategory.DATABASE
        );
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message, 
        `Exception updating achievement progress: ${(error as Error).message}`, 
        ErrorCategory.EXCEPTION
      );
    }
  }
}
