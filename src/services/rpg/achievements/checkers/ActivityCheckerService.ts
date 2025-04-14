
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';

/**
 * Service specifically for checking activity-related achievements
 */
export class ActivityCheckerService extends BaseAchievementChecker {
  /**
   * Implementation of abstract method from BaseAchievementChecker
   */
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        // Get distinct activity types from user's records
        const { data, error } = await supabase.rpc('get_distinct_activity_types', {
          p_user_id: userId
        });
        
        if (error) {
          throw new Error(`Failed to get distinct activity types: ${error.message}`);
        }
        
        // Count distinct types
        const distinctCount = data?.length || 0;
        
        // Check for achievements
        const achievementsToCheck: string[] = [];
        
        if (distinctCount >= 3) achievementsToCheck.push('activity-variety-3');
        if (distinctCount >= 5) achievementsToCheck.push('activity-variety-5');
        
        // Award achievements and return the IDs of awarded achievements
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'ACTIVITY_VARIETY_ACHIEVEMENTS'
    );
  }
  
  /**
   * Check achievements related to activity variety
   */
  static async checkActivityVarietyAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    const checker = new ActivityCheckerService();
    return checker.checkAchievements(userId);
  }
}
