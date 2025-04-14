
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { supabase } from '@/integrations/supabase/client';
import { AchievementCategory } from '@/types/achievementTypes';
import { ACHIEVEMENT_IDS } from '../AchievementConstants';

/**
 * Service specifically for checking streak-related achievements 
 * Extends the BaseAchievementChecker abstract class
 */
export class StreakCheckerService extends BaseAchievementChecker {
  /**
   * Implementation of abstract method from BaseAchievementChecker
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        // Get user's current streak
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('streak')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) {
          throw new Error(`Failed to get user profile for streak check: ${profileError.message}`);
        }
        
        const currentStreak = profile?.streak || 0;
        
        // Define achievements to check based on streak count
        const achievementsToCheck: string[] = [];
        
        // Check for E rank achievements
        if (currentStreak >= 3 && ACHIEVEMENT_IDS.E.STREAK.includes('streak-3')) {
          achievementsToCheck.push('streak-3');
        }
        
        // Check for D rank achievements
        if (currentStreak >= 7 && ACHIEVEMENT_IDS.D.STREAK.includes('streak-7')) {
          achievementsToCheck.push('streak-7');
        }
        
        // Check for C rank achievements
        if (currentStreak >= 14 && ACHIEVEMENT_IDS.C.STREAK.includes('streak-14')) {
          achievementsToCheck.push('streak-14');
        }
        
        // Check for B rank achievements
        if (currentStreak >= 30 && ACHIEVEMENT_IDS.B.STREAK.includes('streak-30')) {
          achievementsToCheck.push('streak-30');
        }
        
        // Check for A rank achievements
        if (currentStreak >= 60 && ACHIEVEMENT_IDS.A.STREAK.includes('streak-60')) {
          achievementsToCheck.push('streak-60');
        }
        
        // Check for S rank achievements
        if (currentStreak >= 100 && ACHIEVEMENT_IDS.S.STREAK.includes('streak-100')) {
          achievementsToCheck.push('streak-100');
        }
        
        if (currentStreak >= 365 && ACHIEVEMENT_IDS.S.STREAK.includes('streak-365')) {
          achievementsToCheck.push('streak-365');
        }
        
        // Award achievements and return the IDs of newly awarded achievements
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'STREAK_ACHIEVEMENTS'
    );
  }
}
