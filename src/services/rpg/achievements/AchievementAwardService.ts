
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { TransactionService } from '../../common/TransactionService';
import { XPService } from '../XPService';

/**
 * Service for awarding achievements to users
 */
export class AchievementAwardService {
  /**
   * Award an achievement to a user with transaction support
   * Ensures achievement and XP are awarded atomically
   */
  static async awardAchievement(
    userId: string, 
    achievementId: string
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // First check if the user already has this achievement
        const { count, error: checkError } = await supabase
          .from('user_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('achievement_id', achievementId);

        if (checkError) throw checkError;

        // If already awarded, return true
        if (count && count > 0) {
          return true;
        }

        // Get achievement details
        const { data: achievement, error: achievementError } = await supabase
          .from('achievements')
          .select('*')
          .eq('id', achievementId)
          .single();

        if (achievementError) throw achievementError;
        if (!achievement) throw new Error(`Achievement ${achievementId} not found`);

        // Use transaction service to ensure atomic operation
        const { data: success, error: transactionError } = await TransactionService.executeInTransaction(async () => {
          // 1. Add achievement to user_achievements
          const { error: insertError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: userId,
              achievement_id: achievementId,
              achieved_at: new Date().toISOString()
            });

          if (insertError) throw insertError;

          // 2. Award XP to user
          const xpResult = await XPService.awardXP(userId, achievement.xp_reward, 'achievement');
          if (!xpResult) throw new Error('Failed to award XP');

          // 3. Update achievement count and points
          await supabase.rpc('increment_profile_counter', {
            user_id_param: userId,
            counter_name: 'achievements_count',
            increment_amount: 1
          });
          
          // 4. Also update achievement_points
          await supabase.rpc('increment_profile_counter', {
            user_id_param: userId,
            counter_name: 'achievement_points',
            increment_amount: achievement.points
          });
          
          // 5. Mark achievement progress as complete if it exists
          const { data: progress } = await supabase
            .from('achievement_progress')
            .select('id, target_value')
            .eq('user_id', userId)
            .eq('achievement_id', achievementId)
            .maybeSingle();
            
          if (progress) {
            await supabase
              .from('achievement_progress')
              .update({
                current_value: progress.target_value,
                is_complete: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', progress.id);
          }

          return true;
        });

        if (transactionError) {
          throw transactionError;
        }

        return success || false;
      },
      'AWARD_ACHIEVEMENT',
      {
        userMessage: 'Não foi possível conceder a conquista',
        showToast: false
      }
    );
  }

  /**
   * Check and award multiple achievements with retry support
   * Uses executeWithRetry for better reliability
   */
  static async checkAndAwardAchievements(
    userId: string, 
    achievementIds: string[]
  ): Promise<ServiceResponse<{ successful: string[], failed: string[] }>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!achievementIds.length) {
          return { successful: [], failed: [] };
        }
          
        // Use the optimized batch check function
        const { data, error } = await supabase.rpc(
          'check_achievement_batch',
          { 
            p_user_id: userId,
            p_achievement_ids: achievementIds 
          }
        );
        
        if (error) {
          // Fall back to individual checks if the batch function fails
          const results = {
            successful: [] as string[],
            failed: [] as string[]
          };

          for (const achievementId of achievementIds) {
            try {
              const result = await TransactionService.executeWithRetry(
                async () => {
                  const awardResult = await this.awardAchievement(userId, achievementId);
                  return awardResult.success;
                },
                'award_achievement_retry',
                3
              );

              if (result) {
                results.successful.push(achievementId);
              } else {
                results.failed.push(achievementId);
              }
            } catch (error) {
              console.error(`Failed to award achievement ${achievementId}:`, error);
              results.failed.push(achievementId);
            }
          }
          
          return results;
        }
          
        // Process the batch results
        const successful = data
          .filter(result => result.awarded)
          .map(result => result.achievement_id);
          
        const failed = achievementIds.filter(id => 
          !successful.includes(id)
        );
          
        return {
          successful,
          failed
        };
      },
      'CHECK_AND_AWARD_ACHIEVEMENTS',
      {
        showToast: false,
        userMessage: 'Erro ao verificar conquistas'
      }
    );
  }
}
