import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { AchievementStandardizationService } from '@/services/common/AchievementStandardizationService';
import { AchievementDatabaseService } from '@/services/common/AchievementDatabaseService';

/**
 * Utility class for working with achievements
 */
export class AchievementUtils {
  private static achievementsCache: Achievement[] | null = null;
  private static lastCacheUpdate: number = 0;
  private static CACHE_TTL = 60000; // 1 minute cache TTL
  
  /**
   * Get all achievements
   * Now fetches from the database as the single source of truth
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    // Check if we have a valid cache
    const now = Date.now();
    if (this.achievementsCache && (now - this.lastCacheUpdate < this.CACHE_TTL)) {
      return this.achievementsCache;
    }
    
    try {
      // Fetch from the database service
      const response = await AchievementDatabaseService.getAllAchievements();
      
      if (response.success) {
        this.achievementsCache = response.data;
        this.lastCacheUpdate = now;
        return response.data;
      } else {
        console.error('Failed to fetch achievements:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Error in getAllAchievements:', error);
      return [];
    }
  }
  
  /**
   * Get achievement by string ID
   */
  static async getAchievementByStringId(stringId: string): Promise<Achievement | null> {
    try {
      // Try to find in cache first for performance
      if (this.achievementsCache) {
        const cachedAchievement = this.achievementsCache.find(a => a.stringId === stringId);
        if (cachedAchievement) {
          return cachedAchievement;
        }
      }
      
      // If not in cache, fetch directly from the database
      const response = await AchievementDatabaseService.getAchievementByStringId(stringId);
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Error finding achievement with stringId ${stringId}:`, error);
      return null;
    }
  }
  
  /**
   * Get achievements by category
   */
  static async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    try {
      // Check if we have a cache, and if so, filter from there
      if (this.achievementsCache) {
        return this.achievementsCache.filter(a => a.category === category);
      }
      
      // Otherwise fetch from the database
      const response = await AchievementDatabaseService.getAchievementsByCategory(category);
      return response.success ? response.data : [];
    } catch (error) {
      console.error(`Error finding achievements for category ${category}:`, error);
      return [];
    }
  }
  
  /**
   * Get achievements by rank
   */
  static async getAchievementsByRank(rank: AchievementRank): Promise<Achievement[]> {
    try {
      // Check if we have a cache, and if so, filter from there
      if (this.achievementsCache) {
        return this.achievementsCache.filter(a => a.rank === rank);
      }
      
      // Otherwise fetch from the database
      const response = await AchievementDatabaseService.getAchievementsByRank(rank);
      return response.success ? response.data : [];
    } catch (error) {
      console.error(`Error finding achievements for rank ${rank}:`, error);
      return [];
    }
  }
  
  /**
   * Clear the achievement cache to force a fresh fetch
   */
  static clearCache(): void {
    this.achievementsCache = null;
    this.lastCacheUpdate = 0;
  }
}
