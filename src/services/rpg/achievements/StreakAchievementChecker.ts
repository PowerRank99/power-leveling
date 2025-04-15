
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { AchievementChecker } from './AchievementCheckerInterface';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { TransactionService } from '../../common/TransactionService';
import { AchievementProgressService } from './AchievementProgressService';
import { AchievementService } from '../AchievementService';

export class StreakAchievementChecker extends BaseAchievementChecker implements AchievementChecker {
  static async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        if (!userId) throw new Error('User ID is required');
        
        const awardedAchievements: string[] = [];

        // Get user's current streak
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('streak')
          .eq('id', userId)
          .maybeSingle();
        
        if (profileError) throw profileError;
        if (!profile) throw new Error('Profile not found');

        const currentStreak = profile.streak || 0;

        // Get streak achievements from database (ordered by required days ascending)
        const { data: streakAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, requirements')
          .eq('category', 'streak')
          .order('requirements->days', { ascending: true });
          
        if (achievementsError) throw achievementsError;

        // Check each achievement
        streakAchievements.forEach(achievement => {
          const requiredDays = achievement.requirements?.days || 0;
          if (currentStreak >= requiredDays) {
            awardedAchievements.push(achievement.id);
          }
        });

        // Use transaction service for consistency
        await TransactionService.executeWithRetry(
          async () => {
            // Update streak achievement progress
            if (currentStreak > 0) {
              await AchievementProgressService.updateStreakProgress(userId, currentStreak);
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

  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return StreakAchievementChecker.checkAchievements(userId);
  }
}
