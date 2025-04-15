import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { TransactionService } from '@/services/common/TransactionService';

/**
 * Service specifically for checking streak-related achievements
 */
export class StreakCheckerService extends BaseAchievementChecker {
  /**
   * Check streak-related achievements
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');
        
        // Get user's current streak
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('streak')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) throw profileError;
        if (!profile) throw new Error('Profile not found');

        // Get streak achievements from database
        const { data: streakAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('category', 'streak')
          .order('requirements->days', { ascending: true });
          
        if (achievementsError) throw achievementsError;

        const awardedAchievements: string[] = [];

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Check each achievement's requirements
            streakAchievements.forEach(achievement => {
              const requiredDays = achievement.requirements?.days || 0;
              if (profile.streak >= requiredDays) {
                awardedAchievements.push(achievement.id);
              }
            });
            
            // Update streak achievement progress
            // Just pass the current streak and let the service handle the rest
            if (profile.streak > 0) {
              await AchievementService.updateAchievementProgress(
                userId,
                'streak-achievement',
                profile.streak,
                profile.streak + 5,
                false
              );
            }
            
            // Award achievements
            if (awardedAchievements.length > 0) {
              await AchievementService.checkAndAwardAchievements(userId, awardedAchievements);
            }
          }, 
          'streak_achievements', 
          3,
          'Failed to check streak achievements'
        );
        
        return awardedAchievements;
      },
      'CHECK_STREAK_ACHIEVEMENTS',
      { showToast: false }
    );
  }

  /**
   * Static method to check streak achievements
   */
  static async checkStreakAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const checker = new StreakCheckerService();
    return checker.checkAchievements(userId);
  }
}
