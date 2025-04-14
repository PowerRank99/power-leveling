
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { AchievementUtils } from '@/constants/achievements';
import { AchievementNotificationService } from './AchievementNotificationService';
import { XPService } from '../../XPService';
import { AchievementDefinition } from '@/constants/achievements/AchievementSchema';

/**
 * Service for handling achievement awards and related operations
 */
export class AchievementAwardService {
  /**
   * Award a specific achievement to a user
   */
  static async awardAchievement(
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
        return createSuccessResponse(false);
      }
      
      // Get achievement definition
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
      await AchievementNotificationService.showAchievementNotification(achievementDef);
      
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
        `Exception in awardAchievement: ${(error as Error).message}`,
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
}
