
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { RankEAchievementChecker } from './RankEAchievementChecker';
import { RankDAchievementChecker } from './RankDAchievementChecker';
import { RankCAchievementChecker } from './RankCAchievementChecker';
import { RankBAchievementChecker } from './RankBAchievementChecker';
import { RankAAchievementChecker } from './RankAAchievementChecker';
import { RankSAchievementChecker } from './RankSAchievementChecker';
import { UserWorkoutStats, UserProfileData } from '../AchievementCheckerInterface';

export class RankAchievementProcessor {
  static async processRankAchievements(
    userId: string,
    workoutStats: UserWorkoutStats,
    userProfile: UserProfileData
  ): Promise<ServiceResponse<void>> {
    // Process achievements in rank order from lowest to highest
    await RankEAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
    await RankDAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
    await RankCAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
    await RankBAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
    await RankAAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
    await RankSAchievementChecker.checkAchievements(userId, workoutStats, userProfile);
    
    return {
      success: true,
      data: undefined
    };
  }
}
