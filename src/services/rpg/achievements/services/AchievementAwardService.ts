
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';
import { TransactionService } from '@/services/common/TransactionService';
import { AchievementProgressService } from '../AchievementProgressService';

export class AchievementAwardService {
  static async awardAchievement(userId: string, achievementId: string): Promise<ServiceResponse<boolean>> {
    try {
      // Get achievement details
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();
        
      if (achievementError || !achievement) {
        return createErrorResponse(
          'Achievement not found',
          `No achievement found with ID: ${achievementId}`,
          ErrorCategory.NOT_FOUND
        );
      }

      // Check if already awarded
      const { data: existingAward, error: existingError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();
        
      if (existingError) throw existingError;
      if (existingAward) return createSuccessResponse(true); // Already awarded

      // Award achievement using transaction
      return await TransactionService.executeInTransaction(async () => {
        // Award achievement
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
              increment_amount: achievement.xp_reward
            })
          })
          .eq('id', userId);
          
        if (profileError) throw profileError;

        // Mark progress as complete
        await AchievementProgressService.updateProgress(
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

  static async checkAndAwardAchievements(userId: string, achievementIds: string[]): Promise<ServiceResponse<boolean>> {
    try {
      if (!achievementIds.length) return createSuccessResponse(true);

      for (const achievementId of achievementIds) {
        const result = await this.awardAchievement(userId, achievementId);
        if (!result.success) {
          console.error(`Failed to award achievement ${achievementId}:`, result.message);
        }
      }

      return createSuccessResponse(true);
    } catch (error) {
      return createErrorResponse(
        'Failed to award achievements',
        error instanceof Error ? error.message : String(error),
        ErrorCategory.DATABASE
      );
    }
  }
}
