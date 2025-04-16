
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { RankEAchievementChecker } from './RankEAchievementChecker';
import { RankDAchievementChecker } from './RankDAchievementChecker';
import { RankCAchievementChecker } from './RankCAchievementChecker';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';

export class RankAchievementProcessor {
  static async processRankAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    // Process achievements in rank order
    await RankEAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
    await RankDAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
    await RankCAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
    
    // Higher ranks will be added as needed
    return {
      success: true,
      data: undefined
    };
  }
}
