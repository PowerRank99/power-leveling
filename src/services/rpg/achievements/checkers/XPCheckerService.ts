
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENT_IDS, ACHIEVEMENT_REQUIREMENTS } from '../AchievementConstants';

/**
 * Service specifically for checking XP-related achievements
 */
export class XPCheckerService extends BaseAchievementChecker {
  /**
   * Implementation of abstract method from BaseAchievementChecker
   */
  async checkAchievements(userId: string, totalXP?: number): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        // Get user's total XP if not provided
        if (totalXP === undefined) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('xp')
            .eq('id', userId)
            .maybeSingle();
            
          if (profileError) {
            throw new Error(`Failed to get user profile for XP check: ${profileError.message}`);
          }
          
          totalXP = profile?.xp || 0;
        }
        
        // Define achievements to check based on XP milestones using constants
        const achievementsToCheck: string[] = [];
        
        const xpMilestones = ACHIEVEMENT_REQUIREMENTS.XP.MILESTONES;
        
        if (totalXP >= xpMilestones[0]) achievementsToCheck.push(ACHIEVEMENT_IDS.C.xp[0]); // xp-1000
        if (totalXP >= xpMilestones[1]) achievementsToCheck.push(ACHIEVEMENT_IDS.B.xp[0]); // xp-5000
        if (totalXP >= xpMilestones[2]) achievementsToCheck.push(ACHIEVEMENT_IDS.A.xp[0]); // xp-10000
        if (totalXP >= xpMilestones[3]) achievementsToCheck.push(ACHIEVEMENT_IDS.S.xp[0]); // xp-50000
        if (totalXP >= xpMilestones[4]) achievementsToCheck.push(ACHIEVEMENT_IDS.S.xp[1]); // xp-100000
        
        // Award achievements and return the IDs of awarded achievements
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'XP_MILESTONE_ACHIEVEMENTS'
    );
  }
  
  /**
   * Static method to check XP milestone achievements
   */
  static async checkXPMilestoneAchievements(
    userId: string, 
    totalXP?: number
  ): Promise<ServiceResponse<string[]>> {
    const checker = new XPCheckerService();
    return checker.checkAchievements(userId, totalXP);
  }
}
