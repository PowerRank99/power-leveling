
import { ServiceResponse, ErrorHandlingService, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from './BaseAchievementChecker';
import { AchievementService } from '@/services/rpg/AchievementService';
import { supabase } from '@/integrations/supabase/client';
import { PersonalRecordData } from '../AchievementCheckerInterface';
import { ACHIEVEMENT_IDS, ACHIEVEMENT_REQUIREMENTS } from '../AchievementConstants';

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
        
        // Define achievements to check based on record count using constants
        const achievementsToCheck: string[] = [];
        
        const countThresholds = ACHIEVEMENT_REQUIREMENTS.RECORD.COUNT_THRESHOLDS;
        
        if (recordCount && recordCount >= countThresholds[0]) achievementsToCheck.push(ACHIEVEMENT_IDS.D.record[0]); // pr-first
        if (recordCount && recordCount >= countThresholds[1]) achievementsToCheck.push(ACHIEVEMENT_IDS.D.record[1]); // pr-5
        if (recordCount && recordCount >= countThresholds[2]) achievementsToCheck.push(ACHIEVEMENT_IDS.C.record[0]); // pr-10
        if (recordCount && recordCount >= countThresholds[3]) achievementsToCheck.push(ACHIEVEMENT_IDS.B.record[0]); // pr-25
        if (recordCount && recordCount >= countThresholds[4]) achievementsToCheck.push(ACHIEVEMENT_IDS.A.record[0]); // pr-50
        
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
