
import { Achievement } from '@/types/achievementTypes';
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { AchievementFetchService as BaseFetchService } from '../AchievementFetchService';

/**
 * Service for fetching achievement-related data
 */
export class AchievementFetchService {
  /**
   * Get all achievements
   */
  static async getAllAchievements(): Promise<ServiceResponse<Achievement[]>> {
    return BaseFetchService.getAllAchievements();
  }
  
  /**
   * Get unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<ServiceResponse<Achievement[]>> {
    return BaseFetchService.getUnlockedAchievements(userId);
  }
  
  /**
   * Get achievement stats for a user
   */
  static async getAchievementStats(userId: string): Promise<ServiceResponse<any>> {
    return BaseFetchService.getAchievementStats(userId);
  }
  
  /**
   * Get achievement progress for a user
   */
  static async getAchievementProgress(userId: string, achievementId: string): Promise<ServiceResponse<any>> {
    return BaseFetchService.getAchievementProgress(userId, achievementId);
  }
  
  /**
   * Get all achievement progress for a user
   */
  static async getAllAchievementProgress(userId: string): Promise<ServiceResponse<any>> {
    return BaseFetchService.getAllAchievementProgress(userId);
  }
}
