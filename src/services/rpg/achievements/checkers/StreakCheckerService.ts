
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { TransactionService } from '@/services/common/TransactionService';

export class StreakCheckerService extends BaseAchievementChecker {
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

        // Get streak achievements from database ordered by required days
        const { data: streakAchievements, error: achievementsError } = await this.fetchAchievementsByCategory(
          'streak',
          'requirements->days'
        );
          
        if (achievementsError) throw achievementsError;
        if (!streakAchievements) return [];

        const awardedAchievements: string[] = [];

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
            if (profile.streak > 0) {
              await AchievementService.updateAchievementProgress(
                userId,
                'streak',
                profile.streak,
                Math.max(profile.streak + 5, 7)
              );
            }
            
            // Award achievements
            if (awardedAchievements.length > 0) {
              await this.awardAchievementsBatch(userId, awardedAchievements);
            }
          }, 
          'streak_achievements', 
          3,
          'Failed to check streak achievements'
        );
        
        return awardedAchievements;
      },
      'CHECK_STREAK_ACHIEVEMENTS'
    );
  }

  static async checkStreakAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const checker = new StreakCheckerService();
    return checker.checkAchievements(userId);
  }
}
