
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { supabase } from '@/integrations/supabase/client';
import { PersonalRecordData } from '../AchievementCheckerInterface';

/**
 * Service specifically for checking personal record achievements
 */
export class RecordCheckerService extends BaseAchievementChecker {
  /**
   * Implementation of abstract method from BaseAchievementChecker
   */
  async checkAchievements(userId: string, recordInfo?: PersonalRecordData): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        // Get user's personal record count
        const { count: recordCount, error: countError } = await supabase
          .from('personal_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (countError) {
          throw new Error(`Failed to count personal records: ${countError.message}`);
        }
        
        // Define achievements to check based on record count
        const achievementsToCheck: string[] = [];
        
        if (recordCount && recordCount >= 1) achievementsToCheck.push('pr-first');
        if (recordCount && recordCount >= 5) achievementsToCheck.push('pr-5');
        if (recordCount && recordCount >= 10) achievementsToCheck.push('pr-10');
        if (recordCount && recordCount >= 25) achievementsToCheck.push('pr-25');
        if (recordCount && recordCount >= 50) achievementsToCheck.push('pr-50');
        
        // Award achievements and return the IDs of awarded achievements
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'PERSONAL_RECORD_ACHIEVEMENTS'
    );
  }
  
  /**
   * Static method to check personal record achievements
   */
  static async checkPersonalRecordAchievements(
    userId: string,
    recordInfo?: PersonalRecordData
  ): Promise<ServiceResponse<string[]>> {
    const checker = new RecordCheckerService();
    return checker.checkAchievements(userId, recordInfo);
  }
}
