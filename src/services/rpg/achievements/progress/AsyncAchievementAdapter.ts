
import { Achievement } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';

/**
 * Adapter service to handle asynchronous achievement operations
 */
export class AsyncAchievementAdapter {
  /**
   * Filter achievements using a predicate function
   */
  static async filterAchievements(
    predicate: (achievement: Achievement) => boolean
  ): Promise<Achievement[]> {
    try {
      const allAchievements = await AchievementUtils.getAllAchievements();
      return allAchievements.filter(predicate);
    } catch (error) {
      console.error('Error filtering achievements:', error);
      return [];
    }
  }
  
  /**
   * Find a single achievement using a predicate function
   */
  static async findAchievement(
    predicate: (achievement: Achievement) => boolean
  ): Promise<Achievement | undefined> {
    try {
      const allAchievements = await AchievementUtils.getAllAchievements();
      return allAchievements.find(predicate);
    } catch (error) {
      console.error('Error finding achievement:', error);
      return undefined;
    }
  }
  
  /**
   * Get an achievement by its ID
   */
  static async getAchievementById(id: string): Promise<Achievement | undefined> {
    return this.findAchievement(a => a.id === id);
  }
  
  /**
   * Map achievements using a transformer function
   */
  static async mapAchievements<T>(
    transformer: (achievement: Achievement) => T
  ): Promise<T[]> {
    try {
      const allAchievements = await AchievementUtils.getAllAchievements();
      return allAchievements.map(transformer);
    } catch (error) {
      console.error('Error mapping achievements:', error);
      return [];
    }
  }
}
