
import { Achievement, AchievementCategory } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';

/**
 * Adapter for handling asynchronous achievement operations
 * Provides a consistent interface for accessing achievement data
 */
export class AsyncAchievementAdapter {
  // Cache for achievements to avoid repeated database calls
  private static achievementsCache: Achievement[] | null = null;
  
  /**
   * Get all achievements with caching support
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    // Use cache if available
    if (this.achievementsCache) {
      return this.achievementsCache;
    }
    
    // Fetch achievements and update cache
    const achievements = await AchievementUtils.getAllAchievements();
    this.achievementsCache = achievements;
    
    return achievements;
  }
  
  /**
   * Reset the cache to force fresh data on next request
   */
  static resetCache(): void {
    this.achievementsCache = null;
  }
  
  /**
   * Filter achievements based on a predicate function
   */
  static async filterAchievements(
    predicate: (achievement: Achievement) => boolean
  ): Promise<Achievement[]> {
    const achievements = await this.getAllAchievements();
    return achievements.filter(predicate);
  }
  
  /**
   * Get a single achievement by ID
   */
  static async getAchievementById(id: string): Promise<Achievement | null> {
    const achievements = await this.getAllAchievements();
    return achievements.find(a => a.id === id) || null;
  }
  
  /**
   * Map achievements using a transform function
   */
  static async mapAchievements<T>(
    transform: (achievement: Achievement) => T
  ): Promise<T[]> {
    const achievements = await this.getAllAchievements();
    return achievements.map(transform);
  }
  
  /**
   * Sort achievements using a comparator function
   */
  static async sortAchievements(
    comparator: (a: Achievement, b: Achievement) => number
  ): Promise<Achievement[]> {
    const achievements = await this.getAllAchievements();
    return [...achievements].sort(comparator);
  }
  
  /**
   * Get achievements by category
   */
  static async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    return this.filterAchievements(a => a.category === category);
  }
  
  /**
   * Simulate awaiting an achievement for backward compatibility with scenario testing
   */
  static async simulateAchievementPromise(achievement: Achievement): Promise<Achievement> {
    return Promise.resolve(achievement);
  }
}
