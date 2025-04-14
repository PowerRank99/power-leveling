
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service specifically for checking streak-related achievements
 */
export class StreakCheckerService extends BaseAchievementChecker {
  /**
   * Implementation of abstract method from BaseAchievementChecker
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<void>> {
    return StreakCheckerService.checkStreakAchievements(userId);
  }
  
  /**
   * Check streak achievements
   */
  static async checkStreakAchievements(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Get user's current streak
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        return createErrorResponse(
          profileError.message,
          'Failed to get user profile for streak check',
          ErrorCategory.DATABASE
        );
      }
      
      const currentStreak = profile?.streak || 0;
      
      // Define achievements to check based on streak count
      const achievementsToCheck = [];
      
      if (currentStreak >= 3) achievementsToCheck.push('streak-3');
      if (currentStreak >= 7) achievementsToCheck.push('streak-7');
      if (currentStreak >= 14) achievementsToCheck.push('streak-14');
      if (currentStreak >= 30) achievementsToCheck.push('streak-30');
      if (currentStreak >= 60) achievementsToCheck.push('streak-60');
      if (currentStreak >= 100) achievementsToCheck.push('streak-100');
      if (currentStreak >= 365) achievementsToCheck.push('streak-365');
      
      // Award achievements
      if (achievementsToCheck.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
      }
      
      return createSuccessResponse(undefined);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkStreakAchievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
}
