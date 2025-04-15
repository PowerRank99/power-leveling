
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
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
        
        // Fetch record-related achievements from the database
        const { data: recordAchievements, error: achievementsError } = await this.fetchAchievementsByCategory(
          'record',
          'requirements->count'
        );
        
        if (achievementsError) {
          throw new Error(`Failed to fetch record achievements: ${achievementsError.message}`);
        }
        
        // Define achievements to check based on record count
        const achievementsToCheck: string[] = [];
        
        // Check each achievement's requirements
        if (recordAchievements) {
          recordAchievements.forEach(achievement => {
            const requiredCount = achievement.requirements?.count || 0;
            if (recordCount && recordCount >= requiredCount) {
              achievementsToCheck.push(achievement.id);
            }
          });
        }
        
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
