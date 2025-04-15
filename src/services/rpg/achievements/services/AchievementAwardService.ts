import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { mapToAchievementCategory } from '@/types/achievementMappers';

/**
 * Service for awarding achievements to users
 */
export class AchievementAwardService {
  /**
   * Award an achievement to a user
   */
  static async awardAchievement(userId: string, achievementId: string): Promise<ServiceResponse<boolean>> {
    try {
      if (!userId || !achievementId) {
        return createErrorResponse(
          'Invalid parameters',
          'User ID and achievement ID are required',
          ErrorCategory.VALIDATION
        );
      }
      
      // Check if already awarded
      const { data: existing, error: checkError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existing) {
        // Already awarded
        return createSuccessResponse(true);
      }
      
      // Get achievement details with proper type mapping
      const achievement = await AchievementUtils.getAchievementById(achievementId);
      
      if (!achievement) {
        return createErrorResponse(
          'Achievement not found',
          `No achievement found with ID: ${achievementId}`,
          ErrorCategory.NOT_FOUND
        );
      }
      
      // Begin transaction
      const { error: beginError } = await supabase.rpc('begin_transaction');
      if (beginError) throw beginError;
      
      try {
        // Award the achievement
        const { error: awardError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievementId
          });
          
        if (awardError) throw awardError;
        
        // Update user profile stats
        const { error: updateError } = await supabase
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
          
        if (updateError) throw updateError;
        
        // Commit transaction
        const { error: commitError } = await supabase.rpc('commit_transaction');
        if (commitError) throw commitError;
        
        return createSuccessResponse(true);
      } catch (transactionError) {
        // Rollback on error
        await supabase.rpc('rollback_transaction');
        throw transactionError;
      }
    } catch (error) {
      return createErrorResponse(
        'Failed to award achievement',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }
  
  /**
   * Check and award multiple achievements in a batch
   */
  static async checkAndAwardAchievements(
    userId: string, 
    achievementIds: string[]
  ): Promise<ServiceResponse<boolean>> {
    try {
      if (!userId || !achievementIds.length) {
        return createErrorResponse(
          'Invalid parameters',
          'User ID and achievement IDs are required',
          ErrorCategory.VALIDATION
        );
      }
      
      // Use batch operation for better performance
      const { data, error } = await supabase.rpc(
        'check_achievement_batch',
        {
          p_user_id: userId,
          p_achievement_ids: achievementIds
        }
      );
      
      if (error) throw error;
      
      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to award achievements in batch',
        error instanceof Error ? error.message : 'Unknown error',
        ErrorCategory.DATABASE
      );
    }
  }
}
