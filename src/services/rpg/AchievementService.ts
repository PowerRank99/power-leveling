import { supabase } from '@/integrations/supabase/client';
import { XPService } from './XPService';
import { toast } from 'sonner';
import { TransactionService } from '../common/TransactionService';
import { ServiceResponse, ErrorHandlingService, ErrorCategory, createErrorResponse, createSuccessResponse } from '../common/ErrorHandlingService';
import { StandardizedAchievementService } from './achievements/StandardizedAchievementService';
import { AchievementFetchService } from './achievements/AchievementFetchService';
import { Achievement } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/AchievementDefinitions';

/**
 * Service for handling achievements
 * Acts as a facade to more specialized achievement services
 */
export class AchievementService {
  /**
   * Award an achievement to a user
   * Delegates to StandardizedAchievementService
   */
  static async awardAchievement(userId: string, achievementId: string): Promise<ServiceResponse<boolean>> {
    return StandardizedAchievementService.checkAndAwardAchievement(userId, achievementId);
  }
  
  /**
   * Check and award a batch of achievements at once
   * Delegates to StandardizedAchievementService
   */
  static async checkAndAwardAchievements(
    userId: string,
    achievementIds: string[]
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId || !achievementIds.length) return false;

        // Validate achievement IDs against our standardized definitions
        const validAchievementIds = achievementIds.filter(id => 
          AchievementUtils.getAchievementById(id) !== undefined
        );
        
        if (validAchievementIds.length === 0) {
          console.warn('No valid achievements found to award');
          return false;
        }

        // Use StandardizedAchievementService to check and award achievements
        const result = await StandardizedAchievementService.checkAndAwardMultipleAchievements(userId, validAchievementIds);
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to check achievements');
        }
        
        // Get newly awarded achievements
        const newlyAwarded = result.data;
        
        if (newlyAwarded?.length) {
          // Show toast for each new achievement
          newlyAwarded.forEach(achievementId => {
            const achievement = AchievementUtils.getAchievementById(achievementId);
            if (achievement) {
              toast.success('Conquista Desbloqueada! 🏆', {
                description: achievement.name
              });
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
   * Delegates to StandardizedAchievementService
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<ServiceResponse<any>> {
    // First use the standardized service to check for workout achievements
    const workoutAchievementsResult = await StandardizedAchievementService.checkWorkoutAchievements(userId);
    
    // Then check streak achievements
    const streakAchievementsResult = await StandardizedAchievementService.checkStreakAchievements(userId);
    
    // Combine results
    const combinedAchievements = [
      ...(workoutAchievementsResult.success ? workoutAchievementsResult.data || [] : []),
      ...(streakAchievementsResult.success ? streakAchievementsResult.data || [] : [])
    ];
    
    return createSuccessResponse(combinedAchievements);
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
    // Validate achievement ID against our standardized definitions
    const achievement = AchievementUtils.getAchievementById(achievementId);
    if (!achievement) {
      return createErrorResponse(
        'Invalid achievement',
        `Achievement with ID ${achievementId} not found in definitions`,
        ErrorCategory.VALIDATION
      );
    }
    
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
