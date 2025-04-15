
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { Achievement, AchievementProgress } from '@/types/achievementTypes';
import { AchievementIdentifierService } from './AchievementIdentifierService';
import { AchievementRepository } from './AchievementRepository';
import { TransactionService } from '@/services/common/TransactionService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Main service for achievement operations
 * Uses the database as the source of truth and handles both string IDs and UUIDs
 */
export class UnifiedAchievementService {
  /**
   * Get all achievements
   */
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    return AchievementRepository.getAllAchievements();
  }
  
  /**
   * Get achievement by ID (supports both string IDs and UUIDs)
   */
  static async getAchievement(idOrStringId: string): Promise<ServiceResponse<Achievement | null>> {
    // First try directly as UUID
    const directResult = await AchievementRepository.getAchievementById(idOrStringId);
    
    if (directResult.success && directResult.data) {
      return directResult;
    }
    
    // If not found as UUID, try as string ID
    return AchievementRepository.getAchievementByStringId(idOrStringId);
  }
  
  /**
   * Get unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return AchievementRepository.getUnlockedAchievements(userId);
  }
  
  /**
   * Check if a user has unlocked an achievement (supports both string IDs and UUIDs)
   */
  static async hasUnlockedAchievement(userId: string, idOrStringId: string): Promise<ServiceResponse<boolean>> {
    let achievementId = idOrStringId;
    
    // If it looks like a string ID (not a UUID), convert it
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrStringId)) {
      const id = await AchievementIdentifierService.getIdByStringId(idOrStringId);
      if (!id) {
        return createErrorResponse(
          'Achievement not found',
          `No achievement found with string ID: ${idOrStringId}`,
          ErrorCategory.NOT_FOUND
        );
      }
      achievementId = id;
    }
    
    return AchievementRepository.hasUnlockedAchievement(userId, achievementId);
  }
  
  /**
   * Award an achievement to a user (supports both string IDs and UUIDs)
   */
  static async awardAchievement(userId: string, idOrStringId: string): Promise<ServiceResponse<boolean>> {
    try {
      let achievementId = idOrStringId;
      let achievement: Achievement | null = null;
      
      // First determine if this is a string ID or UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrStringId)) {
        // It's a string ID, convert to UUID
        const id = await AchievementIdentifierService.getIdByStringId(idOrStringId);
        if (!id) {
          return createErrorResponse(
            'Achievement not found',
            `No achievement found with string ID: ${idOrStringId}`,
            ErrorCategory.NOT_FOUND
          );
        }
        achievementId = id;
      }
      
      // Get achievement details
      const achievementResult = await AchievementRepository.getAchievementById(achievementId);
      if (!achievementResult.success || !achievementResult.data) {
        return createErrorResponse(
          'Achievement not found',
          `No achievement found with ID: ${achievementId}`,
          ErrorCategory.NOT_FOUND
        );
      }
      
      achievement = achievementResult.data;
      
      // Check if already awarded
      const alreadyUnlockedResult = await AchievementRepository.hasUnlockedAchievement(userId, achievementId);
      if (alreadyUnlockedResult.success && alreadyUnlockedResult.data) {
        return createSuccessResponse(true); // Already awarded
      }
      
      // Use transaction to ensure consistent state
      return await TransactionService.executeInTransaction(async () => {
        // Award the achievement
        const { error: awardError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievementId,
            achieved_at: new Date().toISOString()
          });
          
        if (awardError) throw awardError;
        
        // Update user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            achievements_count: supabase.rpc('increment_profile_counter', {
              user_id_param: userId,
              counter_name: 'achievements_count',
              increment_amount: 1
            }),
            achievement_points: supabase.rpc('increment_profile_counter', {
              user_id_param: userId,
              counter_name: 'achievement_points',
              increment_amount: achievement.points
            }),
            xp: supabase.rpc('increment_profile_counter', {
              user_id_param: userId,
              counter_name: 'xp',
              increment_amount: achievement.xpReward
            })
          })
          .eq('id', userId);
          
        if (profileError) throw profileError;
        
        // Mark progress as complete if it exists
        await AchievementRepository.updateAchievementProgress(
          userId,
          achievementId,
          achievement.requirements?.value || 0,
          achievement.requirements?.value || 0,
          true
        );
        
        return true;
      }, 'award_achievement');
    } catch (error) {
      return createErrorResponse(
        'Failed to award achievement',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Update achievement progress
   */
  static async updateAchievementProgress(
    userId: string,
    idOrStringId: string,
    currentValue: number,
    targetValue: number,
    isComplete: boolean
  ): Promise<ServiceResponse<boolean>> {
    try {
      let achievementId = idOrStringId;
      
      // First determine if this is a string ID or UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrStringId)) {
        // It's a string ID, convert to UUID
        const id = await AchievementIdentifierService.getIdByStringId(idOrStringId);
        if (!id) {
          return createErrorResponse(
            'Achievement not found',
            `No achievement found with string ID: ${idOrStringId}`,
            ErrorCategory.NOT_FOUND
          );
        }
        achievementId = id;
      }
      
      return AchievementRepository.updateAchievementProgress(
        userId,
        achievementId,
        currentValue,
        targetValue,
        isComplete
      );
    } catch (error) {
      return createErrorResponse(
        'Failed to update achievement progress',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Get achievement progress
   */
  static async getAchievementProgress(
    userId: string,
    idOrStringId: string
  ): Promise<ServiceResponse<AchievementProgress | null>> {
    try {
      let achievementId = idOrStringId;
      
      // First determine if this is a string ID or UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrStringId)) {
        // It's a string ID, convert to UUID
        const id = await AchievementIdentifierService.getIdByStringId(idOrStringId);
        if (!id) {
          return createErrorResponse(
            'Achievement not found',
            `No achievement found with string ID: ${idOrStringId}`,
            ErrorCategory.NOT_FOUND
          );
        }
        achievementId = id;
      }
      
      return AchievementRepository.getAchievementProgress(userId, achievementId);
    } catch (error) {
      return createErrorResponse(
        'Failed to get achievement progress',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
}
