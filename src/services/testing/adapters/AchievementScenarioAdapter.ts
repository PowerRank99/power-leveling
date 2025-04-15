
import { Achievement } from '@/types/achievementTypes';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';

/**
 * Adapter service for testing scenarios to interact with achievements
 */
export class AchievementScenarioAdapter {
  private static achievementCache: Map<string, Achievement> = new Map();
  
  /**
   * Get an achievement by ID, with caching for performance
   */
  static async getAchievementById(id: string): Promise<Achievement | null> {
    // Check cache first
    if (this.achievementCache.has(id)) {
      return this.achievementCache.get(id) || null;
    }
    
    try {
      // Fetch all achievements
      const achievements = await AchievementUtils.getAllAchievements();
      
      // Find the achievement by ID
      const achievement = achievements.find(a => a.id === id);
      
      // Cache for future use
      if (achievement) {
        this.achievementCache.set(id, achievement);
      }
      
      return achievement || null;
    } catch (error) {
      console.error(`Error fetching achievement ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Get all achievements matching a specific predicate
   */
  static async getAchievementsByPredicate(
    predicate: (achievement: Achievement) => boolean
  ): Promise<Achievement[]> {
    try {
      const achievements = await AchievementUtils.getAllAchievements();
      return achievements.filter(predicate);
    } catch (error) {
      console.error('Error filtering achievements:', error);
      return [];
    }
  }
  
  /**
   * Get all achievements by category
   */
  static async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return this.getAchievementsByPredicate(a => a.category === category);
  }
  
  /**
   * Get all achievements by rank
   */
  static async getAchievementsByRank(rank: string): Promise<Achievement[]> {
    return this.getAchievementsByPredicate(a => a.rank === rank);
  }
  
  /**
   * Clear the achievement cache
   */
  static clearCache(): void {
    this.achievementCache.clear();
  }
}
