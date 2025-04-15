
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { AchievementStandardizationService } from '@/services/common/AchievementStandardizationService';
import { AchievementDatabaseService } from '@/services/common/AchievementDatabaseService';
import { PerformanceMonitorService } from '@/services/common/PerformanceMonitorService';

/**
 * Utility class for working with achievements
 * Now uses the database as the single source of truth
 */
export class AchievementUtils {
  private static achievementsCache: Achievement[] | null = null;
  private static lastCacheUpdate: number = 0;
  private static CACHE_TTL = 60000; // 1 minute cache TTL
  private static cachePromise: Promise<Achievement[]> | null = null;
  
  /**
   * Get all achievements
   * Fetches from the database as the single source of truth
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    // Check if we have a valid cache
    const now = Date.now();
    if (this.achievementsCache && (now - this.lastCacheUpdate < this.CACHE_TTL)) {
      return this.achievementsCache;
    }
    
    // Check if we're already fetching
    if (this.cachePromise) {
      return this.cachePromise;
    }
    
    try {
      PerformanceMonitorService.startMeasure('achievement-fetch');
      
      // Create a new promise for the fetch operation
      this.cachePromise = new Promise(async (resolve, reject) => {
        try {
          // Fetch from the database service
          const response = await AchievementDatabaseService.getAllAchievements();
          
          if (response.success) {
            this.achievementsCache = response.data;
            this.lastCacheUpdate = now;
            resolve(response.data);
          } else {
            console.error('Failed to fetch achievements:', response.error);
            resolve([]);
          }
        } catch (error) {
          console.error('Error in getAllAchievements:', error);
          resolve([]);
        } finally {
          PerformanceMonitorService.endMeasure('achievement-fetch');
          this.cachePromise = null;
        }
      });
      
      return this.cachePromise;
    } catch (error) {
      console.error('Error in getAllAchievements:', error);
      return [];
    }
  }
  
  /**
   * Get all achievements (synchronous version that returns empty array if cache isn't available)
   * @deprecated Use the async version instead when possible
   */
  static getAllAchievementsSync(): Achievement[] {
    return this.achievementsCache || [];
  }
  
  /**
   * Get achievement by ID
   * For backward compatibility - attempts to find by either string ID or UUID
   */
  static async getAchievementByStringId(stringId: string): Promise<Achievement | null> {
    try {
      // Try to find in cache first for performance
      if (this.achievementsCache) {
        const cachedAchievement = this.achievementsCache.find(a => a.stringId === stringId || a.id === stringId);
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
   * For backward compatibility with existing code
   */
  static async getAchievementById(id: string): Promise<Achievement | null> {
    return this.getAchievementByStringId(id);
  }
  
  /**
   * Get achievement by ID (synchronous version)
   * @deprecated Use the async version instead when possible
   */
  static getAchievementByIdSync(id: string): Achievement | null {
    if (!this.achievementsCache) return null;
    return this.achievementsCache.find(a => a.id === id || a.stringId === id) || null;
  }
  
  /**
   * Get achievements by category
   */
  static async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    try {
      // Get all achievements first (this ensures cache is populated)
      const allAchievements = await this.getAllAchievements();
      
      // Then filter by category
      return allAchievements.filter(a => a.category === category);
    } catch (error) {
      console.error(`Error finding achievements for category ${category}:`, error);
      return [];
    }
  }
  
  /**
   * Get achievements by category (synchronous version)
   * @deprecated Use the async version instead when possible
   */
  static getAchievementsByCategorySync(category: AchievementCategory): Achievement[] {
    if (!this.achievementsCache) return [];
    return this.achievementsCache.filter(a => a.category === category);
  }
  
  /**
   * Get achievements by rank
   */
  static async getAchievementsByRank(rank: AchievementRank): Promise<Achievement[]> {
    try {
      // Get all achievements first (this ensures cache is populated)
      const allAchievements = await this.getAllAchievements();
      
      // Then filter by rank
      return allAchievements.filter(a => a.rank === rank);
    } catch (error) {
      console.error(`Error finding achievements for rank ${rank}:`, error);
      return [];
    }
  }
  
  /**
   * Get achievements by rank (synchronous version)
   * @deprecated Use the async version instead when possible
   */
  static getAchievementsByRankSync(rank: AchievementRank): Achievement[] {
    if (!this.achievementsCache) return [];
    return this.achievementsCache.filter(a => a.rank === rank);
  }
  
  /**
   * Clear the achievement cache to force a fresh fetch
   */
  static clearCache(): void {
    this.achievementsCache = null;
    this.lastCacheUpdate = 0;
    this.cachePromise = null;
  }
  
  /**
   * Validate an achievement object
   * For backward compatibility
   */
  static validateAchievement(achievement: any): boolean {
    // Basic validation
    if (!achievement) return false;
    
    // Check required fields
    const requiredFields = ['id', 'name', 'description', 'category', 'rank', 'points', 'xpReward'];
    for (const field of requiredFields) {
      if (!achievement[field]) return false;
    }
    
    return true;
  }
  
  /**
   * Convert a legacy achievement definition to the Achievement type
   * For backward compatibility
   */
  static convertToAchievement(def: any): Achievement {
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      category: def.category,
      rank: def.rank,
      points: def.points,
      xpReward: def.xpReward,
      iconName: def.iconName || 'award',
      requirements: {
        type: def.requirementType || 'generic',
        value: def.requirementValue || 1
      },
      stringId: def.stringId || AchievementStandardizationService.standardizeId(def.id)
    };
  }
}

// Initialize the cache on module load
AchievementUtils.getAllAchievements().catch(err => 
  console.error('Failed to initialize achievement cache:', err)
);
