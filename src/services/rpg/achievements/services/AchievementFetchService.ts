
import { Achievement, AchievementCategory, AchievementRank, AchievementStats } from '@/types/achievementTypes';
import { ServiceResponse, createSuccessResponse, createErrorResponse, ErrorCategory } from '@/services/common/ErrorHandlingService';
import { AchievementListService } from '../fetch/AchievementListService';
import { AchievementStatsService } from '../fetch/AchievementStatsService';
import { AchievementProgressFetchService } from '../fetch/AchievementProgressFetchService';

/**
 * Service for fetching achievement data
 */
export class AchievementFetchService {
  /**
   * Get all achievements
   */
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    return AchievementListService.getAllAchievements();
  }
  
  /**
   * Get unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return AchievementListService.getUnlockedAchievements(userId);
  }
  
  /**
   * Get achievement statistics for a user
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<AchievementStats>> {
    return AchievementStatsService.getAchievementStats(userId);
  }
  
  /**
   * Get all achievement progress for a user
   */
  static async getAllAchievementProgress(userId: string): Promise<ServiceResponse<any>> {
    return AchievementProgressFetchService.getAllAchievementProgress(userId);
  }
}
