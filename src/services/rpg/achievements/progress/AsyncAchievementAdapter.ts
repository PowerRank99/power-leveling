
import { Achievement } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';

/**
 * Helper class for adapting achievement batch operations to work with async data
 */
export class AsyncAchievementAdapter {
  /**
   * Filter achievements by a predicate function, handling async achievements
   */
  static async filterAchievements(
    predicate: (achievement: Achievement) => boolean
  ): Promise<Achievement[]> {
    const achievements = await AchievementUtils.getAllAchievements();
    return achievements.filter(predicate);
  }
  
  /**
   * Map achievements using a mapping function, handling async achievements
   */
  static async mapAchievements<T>(
    mapper: (achievement: Achievement) => T
  ): Promise<T[]> {
    const achievements = await AchievementUtils.getAllAchievements();
    return achievements.map(mapper);
  }
  
  /**
   * Sort achievements using a comparator function, handling async achievements
   */
  static async sortAchievements(
    comparator: (a: Achievement, b: Achievement) => number
  ): Promise<Achievement[]> {
    const achievements = await AchievementUtils.getAllAchievements();
    return [...achievements].sort(comparator);
  }
  
  /**
   * Safely get an achievement by ID and perform an operation on it
   */
  static async withAchievement<T>(
    achievementId: string,
    operation: (achievement: Achievement) => T,
    defaultValue: T
  ): Promise<T> {
    const achievement = await AchievementUtils.getAchievementByStringId(achievementId);
    if (!achievement) return defaultValue;
    return operation(achievement);
  }
}
