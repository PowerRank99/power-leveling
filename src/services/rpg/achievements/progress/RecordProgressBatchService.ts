import { Achievement, AchievementCategory } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { UserProfileService } from '@/services/rpg/UserProfileService';
import { AsyncAchievementAdapter } from './AsyncAchievementAdapter';

/**
 * Service for batch processing record-related achievement progress
 */
export class RecordProgressBatchService {
  /**
   * Update progress for all record-related achievements
   */
  static async updateAllRecordProgress(userId: string): Promise<void> {
    const recordAchievements = await AsyncAchievementAdapter.filterAchievements(
      a => a.category === AchievementCategory.RECORD
    );
    
    // Fetch user profile to get current record stats
    const profileResult = await UserProfileService.getUserProfile(userId);
    if (!profileResult.success || !profileResult.data) {
      console.error('Failed to fetch user profile for record progress update:', profileResult.error);
      return;
    }
    
    const userProfile = profileResult.data;
    
    // Process each record achievement
    for (const achievement of recordAchievements) {
      const requirementType = achievement.requirements?.type;
      const requirementValue = achievement.requirements?.value;
      
      if (!requirementType || !requirementValue) {
        console.warn(`Skipping record achievement ${achievement.id} due to missing requirements`);
        continue;
      }
      
      let currentValue = 0;
      
      // Determine current value based on requirement type
      switch (requirementType) {
        case 'max_weight_lifted':
          currentValue = userProfile.stats?.maxWeightLifted || 0;
          break;
        case 'total_distance_run':
          currentValue = userProfile.stats?.totalDistanceRun || 0;
          break;
        case 'longest_workout_duration':
          currentValue = userProfile.stats?.longestWorkoutDuration || 0;
          break;
        default:
          console.warn(`Unsupported record type: ${requirementType}`);
          continue;
      }
      
      // Update progress if the current value meets or exceeds the requirement
      if (currentValue >= requirementValue) {
        await AchievementUtils.updateAchievementProgress(
          userId,
          achievement.id,
          requirementValue,
          requirementValue,
          true
        );
      } else {
        await AchievementUtils.updateAchievementProgress(
          userId,
          achievement.id,
          currentValue,
          requirementValue,
          false
        );
      }
    }
  }
}
