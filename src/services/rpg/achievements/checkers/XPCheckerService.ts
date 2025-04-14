
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service specifically for checking XP-related achievements
 */
export class XPCheckerService extends BaseAchievementChecker {
  /**
   * Implementation of abstract method from BaseAchievementChecker
   */
  async checkAchievements(userId: string, totalXP?: number): Promise<ServiceResponse<void>> {
    return XPCheckerService.checkXPMilestoneAchievements(userId, totalXP);
  }
  
  /**
   * Check XP milestone achievements
   */
  static async checkXPMilestoneAchievements(
    userId: string, 
    totalXP?: number
  ): Promise<ServiceResponse<void>> {
    try {
      // Get user's total XP if not provided
      if (totalXP === undefined) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('xp')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) {
          return createErrorResponse(
            profileError.message,
            'Failed to get user profile for XP check',
            ErrorCategory.DATABASE
          );
        }
        
        totalXP = profile?.xp || 0;
      }
      
      // Define achievements to check based on XP milestones
      const achievementsToCheck = [];
      
      if (totalXP >= 1000) achievementsToCheck.push('xp-1000');
      if (totalXP >= 5000) achievementsToCheck.push('xp-5000');
      if (totalXP >= 10000) achievementsToCheck.push('xp-10000');
      if (totalXP >= 50000) achievementsToCheck.push('xp-50000');
      if (totalXP >= 100000) achievementsToCheck.push('xp-100000');
      
      // Award achievements
      if (achievementsToCheck.length > 0) {
        await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
      }
      
      return createSuccessResponse(undefined);
    } catch (error) {
      return createErrorResponse(
        (error as Error).message,
        `Exception in checkXPMilestoneAchievements: ${(error as Error).message}`,
        ErrorCategory.EXCEPTION
      );
    }
  }
}
