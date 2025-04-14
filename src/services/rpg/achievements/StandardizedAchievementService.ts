
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { AchievementDefinition, AchievementUtils } from '@/constants/AchievementDefinitions';
import { achievementPopupStore } from '@/stores/achievementPopupStore';
import { useAchievementNotificationStore } from '@/stores/achievementNotificationStore';
import { XPService } from '../XPService';

/**
 * Standardized achievement service that provides consistent achievement verification and awarding.
 * Acts as a facade for all achievement-related operations.
 */
export class StandardizedAchievementService {
  /**
   * Check and award a specific achievement to a user
   */
  static async checkAndAwardAchievement(
    userId: string, 
    achievementId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      if (!userId || !achievementId) {
        return createErrorResponse(
          'Invalid parameters',
          'User ID and achievement ID are required',
          ErrorCategory.VALIDATION
        );
      }

      // Check if achievement already awarded
      const { data: existingAchievement, error: checkError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();
        
      if (checkError) {
        return createErrorResponse(
          checkError.message,
          'Failed to check existing achievement',
          ErrorCategory.DATABASE
        );
      }
      
      // If already awarded, just return success
      if (existingAchievement) {
        return createSuccessResponse(false); // Indicates no new achievement
      }
      
      // Get achievement definition from centralized system
      const achievementDef = AchievementUtils.getAchievementById(achievementId);
      
      if (!achievementDef) {
        return createErrorResponse(
          'Achievement not found',
          `Achievement with ID ${achievementId} not found in definitions`,
          ErrorCategory.VALIDATION
        );
      }
      
      // Award the achievement
      const { error: awardError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId
        });
        
      if (awardError) {
        return createErrorResponse(
          awardError.message,
          'Failed to award achievement',
          ErrorCategory.DATABASE
        );
      }
      
      // Update profile counters
      await this.updateProfileCounters(userId, achievementDef);
      
      // Show notification
      this.showAchievementNotification(achievementDef);
      
      // Award XP
      if (achievementDef.xpReward > 0) {
        await XPService.awardXP(
          userId, 
          achievementDef.xpReward, 
          'achievement', 
          { achievementName: achievementDef.name }
        );
      }
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkAndAwardAchievement: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Check and award multiple achievements at once
   */
  static async checkAndAwardMultipleAchievements(
    userId: string,
    achievementIds: string[]
  ): Promise<ServiceResponse<string[]>> {
    try {
      if (!userId || !achievementIds.length) {
        return createSuccessResponse([]);
      }
      
      const awardedAchievements: string[] = [];
      
      // Check which achievements aren't already awarded
      const { data: existingAchievements, error: checkError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)
        .in('achievement_id', achievementIds);
        
      if (checkError) {
        return createErrorResponse(
          checkError.message,
          'Failed to check existing achievements',
          ErrorCategory.DATABASE
        );
      }
      
      const existingIds = existingAchievements?.map(a => a.achievement_id) || [];
      const newAchievementIds = achievementIds.filter(id => !existingIds.includes(id));
      
      // If no new achievements, return early
      if (newAchievementIds.length === 0) {
        return createSuccessResponse([]);
      }
      
      // Award new achievements in batch
      const achievementsToInsert = newAchievementIds.map(achievementId => ({
        user_id: userId,
        achievement_id: achievementId
      }));
      
      const { error: batchError } = await supabase
        .from('user_achievements')
        .insert(achievementsToInsert);
        
      if (batchError) {
        return createErrorResponse(
          batchError.message,
          'Failed to award achievements in batch',
          ErrorCategory.DATABASE
        );
      }
      
      // Process each awarded achievement
      for (const achievementId of newAchievementIds) {
        const achievementDef = AchievementUtils.getAchievementById(achievementId);
        
        if (achievementDef) {
          // Update profile counters
          await this.updateProfileCounters(userId, achievementDef);
          
          // Show notification
          this.showAchievementNotification(achievementDef);
          
          // Award XP
          if (achievementDef.xpReward > 0) {
            await XPService.awardXP(
              userId, 
              achievementDef.xpReward, 
              'achievement', 
              { achievementName: achievementDef.name }
            );
          }
          
          awardedAchievements.push(achievementId);
        }
      }
      
      return createSuccessResponse(awardedAchievements);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkAndAwardMultipleAchievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Update profile achievement counters
   */
  private static async updateProfileCounters(userId: string, achievement: AchievementDefinition): Promise<void> {
    await supabase.rpc('increment_profile_counter', { 
      user_id_param: userId,
      counter_name: 'achievements_count',
      increment_amount: 1
    });
    
    await supabase.rpc('increment_profile_counter', { 
      user_id_param: userId,
      counter_name: 'achievement_points',
      increment_amount: achievement.points
    });
  }
  
  /**
   * Show achievement notification
   */
  private static showAchievementNotification(achievement: AchievementDefinition): void {
    // First show the achievement popup if a user is viewing it
    const { showAchievement } = achievementPopupStore.getState();
    
    showAchievement({
      id: achievement.id,
      title: achievement.name,
      description: achievement.description,
      xpReward: achievement.xpReward,
      points: achievement.points,
      rank: achievement.rank,
      bonusText: "Excede o limite diário"
    });
    
    // Also queue it in the notification system for persistent display
    const { queueNotification } = useAchievementNotificationStore.getState();
    
    queueNotification({
      id: achievement.id,
      title: achievement.name,
      description: achievement.description,
      rank: achievement.rank,
      points: achievement.points,
      xpReward: achievement.xpReward,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Check for workout-related achievements using the standardized definitions
   */
  static async checkWorkoutAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    try {
      if (!userId) {
        return createSuccessResponse([]);
      }
      
      // Get user's workout stats
      const { count: workoutCount, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (countError) {
        return createErrorResponse(
          countError.message,
          'Failed to count workouts',
          ErrorCategory.DATABASE
        );
      }
      
      // Get achievement definitions related to workout counts from centralized system
      const workoutAchievements = AchievementUtils
        .getAchievementsByCategory('workout')
        .filter(a => a.requirementType === 'workouts_count')
        .sort((a, b) => b.requirementValue - a.requirementValue); // Sort descending
      
      // Find achievements to award
      const achievementsToCheck: string[] = [];
      
      for (const achievement of workoutAchievements) {
        if (workoutCount && workoutCount >= achievement.requirementValue) {
          achievementsToCheck.push(achievement.id);
        }
      }
      
      // Award achievements
      if (achievementsToCheck.length > 0) {
        const result = await this.checkAndAwardMultipleAchievements(userId, achievementsToCheck);
        return result;
      }
      
      return createSuccessResponse([]);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkWorkoutAchievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
  
  /**
   * Check streak-related achievements
   */
  static async checkStreakAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    try {
      if (!userId) {
        return createSuccessResponse([]);
      }
      
      // Get user's current streak
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        return createErrorResponse(
          profileError.message,
          'Failed to get user profile',
          ErrorCategory.DATABASE
        );
      }
      
      const currentStreak = profile?.streak || 0;
      
      // Get streak achievements from centralized definitions
      const streakAchievements = AchievementUtils
        .getAchievementsByCategory('streak')
        .filter(a => a.requirementType === 'streak_days')
        .sort((a, b) => b.requirementValue - a.requirementValue); // Sort descending
      
      // Find achievements to award
      const achievementsToCheck: string[] = [];
      
      for (const achievement of streakAchievements) {
        if (currentStreak >= achievement.requirementValue) {
          achievementsToCheck.push(achievement.id);
        }
      }
      
      // Award achievements
      if (achievementsToCheck.length > 0) {
        const result = await this.checkAndAwardMultipleAchievements(userId, achievementsToCheck);
        return result;
      }
      
      return createSuccessResponse([]);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkStreakAchievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
}
