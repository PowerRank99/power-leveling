
import { Achievement, AchievementCategory } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';

/**
 * Adapter service to help with the transition from synchronous to asynchronous achievement fetching
 * This service provides helper methods to load achievements and then filter them for different processors
 */
export class AchievementAsyncAdapterService {
  /**
   * Loads all achievements and filters them by category
   */
  static async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    const allAchievements = await AchievementUtils.getAllAchievements();
    return allAchievements.filter(a => a.category === category);
  }
  
  /**
   * Loads all achievements and then returns the one with the matching ID
   */
  static async getAchievementById(id: string): Promise<Achievement | null> {
    return AchievementUtils.getAchievementById(id);
  }
  
  /**
   * Helper method for filtering achievements by categories in batch services
   * This loads achievements once and then returns a filtering function
   */
  static async createCategoryFilter(category: AchievementCategory): Promise<Achievement[]> {
    const allAchievements = await AchievementUtils.getAllAchievements();
    return allAchievements.filter(a => a.category === category);
  }
  
  /**
   * Helper method for mapping achievements
   */
  static async mapAchievements<T>(mapper: (achievements: Achievement[]) => T): Promise<T> {
    const achievements = await AchievementUtils.getAllAchievements();
    return mapper(achievements);
  }
}
