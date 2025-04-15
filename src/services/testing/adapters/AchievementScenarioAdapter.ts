
import { Achievement } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';

/**
 * Adapter to help scenarios work with the new async achievement system
 */
export class AchievementScenarioAdapter {
  /**
   * Get achievement by ID for scenarios
   */
  static async getAchievementById(id: string): Promise<Achievement | null> {
    return AchievementUtils.getAchievementByStringId(id);
  }
  
  /**
   * Map achievements for scenario
   */
  static async mapAchievements<T>(mapper: (achievements: Achievement[]) => T): Promise<T> {
    const achievements = await AchievementUtils.getAllAchievements();
    return mapper(achievements);
  }
  
  /**
   * Sort achievements for scenario
   */
  static async sortAchievements<T>(sorter: (achievements: Achievement[]) => T): Promise<T> {
    const achievements = await AchievementUtils.getAllAchievements();
    return sorter(achievements);
  }
}
