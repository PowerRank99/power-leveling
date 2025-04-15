import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { AsyncAchievementAdapter } from '../progress/AsyncAchievementAdapter';

/**
 * Service for awarding achievements to users
 */
export class AchievementAwardService {
  /**
   * Award an achievement to a user
   */
  static async awardAchievement(userId: string, achievementId: string): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Check if achievement exists
        const achievement = await AchievementUtils.getAchievementById(achievementId);
        if (!achievement) {
          throw new Error(`Achievement not found: ${achievementId}`);
        }
        
        // Check if user already has this achievement
        const { data: existingAchievements } = await this.getUserAchievementIds(userId);
        
        if (existingAchievements.includes(achievementId)) {
          return false;
        }
        
        // Award achievement
        await this.insertAchievement(userId, achievementId);
        
        // Update profile stats and award XP
        await this.updateProfileForAchievement(userId, achievement);
        
        // Create notification (simplified version)
        await this.createAchievementNotification(userId, achievement);
        
        return true;
      },
      'AWARD_ACHIEVEMENT',
      { showToast: false }
    );
  }
  
  /**
   * Check and award multiple achievements
   */
  static async checkAndAwardAchievements(userId: string, achievementIds: string[]): Promise<ServiceResponse<boolean>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!achievementIds.length) return false;
        
        let awarded = false;
        
        for (const achievementId of achievementIds) {
          const result = await this.awardAchievement(userId, achievementId);
          if (result.success && result.data) {
            awarded = true;
          }
        }
        
        return awarded;
      },
      'CHECK_AND_AWARD_ACHIEVEMENTS',
      { showToast: false }
    );
  }
  
  /**
   * Get user's achievement IDs
   */
  static async getUserAchievementIds(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        return data?.map(item => item.achievement_id) || [];
      },
      'GET_USER_ACHIEVEMENT_IDS',
      { showToast: false }
    );
  }
  
  /**
   * Insert achievement for user
   */
  private static async insertAchievement(userId: string, achievementId: string): Promise<void> {
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        achieved_at: new Date().toISOString()
      });
      
    if (error) throw error;
  }
  
  /**
   * Update user profile with achievement stats
   */
  private static async updateProfileForAchievement(userId: string, achievement: Achievement): Promise<void> {
    // Increment achievement points (simplified version)
    await supabase.rpc('increment_profile_counter', {
      user_id_param: userId,
      counter_name: 'achievement_points',
      increment_amount: achievement.points
    });
    
    // Award XP (simplified version)
    if (achievement.xpReward > 0) {
      await supabase.rpc('award_xp', {
        user_id_param: userId,
        xp_amount: achievement.xpReward,
        source: `Achievement: ${achievement.name}`
      });
    }
  }
  
  /**
   * Create achievement notification (simplified version)
   */
  private static async createAchievementNotification(userId: string, achievement: Achievement): Promise<void> {
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'achievement',
        title: 'Achievement Unlocked',
        description: achievement.name,
        metadata: {
          achievementId: achievement.id,
          rank: achievement.rank,
          points: achievement.points,
          xpReward: achievement.xpReward
        },
        read: false,
        created_at: new Date().toISOString()
      });
  }
}
