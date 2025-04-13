
import { supabase } from '@/integrations/supabase/client';
import { XPService } from './XPService';
import { toast } from 'sonner';
import { TransactionService } from '../common/TransactionService';
import { ServiceResponse, ErrorHandlingService } from '../common/ErrorHandlingService';

/**
 * Service for handling achievements
 */
export class AchievementService {
  /**
   * Check and award a batch of achievements at once
   */
  static async checkAndAwardAchievements(
    userId: string,
    achievementIds: string[]
  ): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId || !achievementIds.length) return false;

        // Convert string IDs to UUIDs
        const uuidAchievementIds = achievementIds;
        
        // Use transaction service for reliability
        const result = await TransactionService.executeWithRetry(
          async () => {
            // Check and award achievements in batch using RPC function
            const { data, error } = await supabase.rpc('check_achievement_batch', {
              p_user_id: userId,
              p_achievement_ids: uuidAchievementIds
            });
            
            if (error) throw error;
            
            return data;
          },
          'award_achievements',
          3,
          'Failed to award achievements'
        );
        
        // Get newly awarded achievements
        const newlyAwarded = result?.filter(a => a.awarded);
        
        if (newlyAwarded?.length) {
          // Fetch full achievement details for awarded achievements
          const { data: details } = await supabase
            .from('achievements')
            .select('name, description, xp_reward, icon_name')
            .in('id', newlyAwarded.map(a => a.achievement_id));
          
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
}
