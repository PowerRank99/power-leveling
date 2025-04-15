
/**
 * AchievementUtils
 * 
 * Static utility methods for achievement operations
 */
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';

export class AchievementUtils {
  // Cache for achievements to improve performance
  private static achievementCache: Map<string, Achievement> = new Map();
  // Cache for all achievements
  private static allAchievementsCache: Achievement[] | null = null;
  
  /**
   * Get all achievements from the database
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    try {
      // Return cached achievements if available
      if (this.allAchievementsCache !== null) {
        return this.allAchievementsCache;
      }
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank', { ascending: false });
        
      if (error) throw error;
      
      const achievements = data as Achievement[] || [];
      
      // Cache the results for future use
      this.allAchievementsCache = achievements;
      
      // Also cache individual achievements by ID
      achievements.forEach(achievement => {
        this.achievementCache.set(achievement.id, achievement);
      });
      
      return achievements;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }
  
  /**
   * Get all achievements (synchronous version that returns cached data or empty array)
   * Used for performance-critical operations 
   */
  static getAllAchievementsSync(): Achievement[] {
    // Return cached achievements if available
    if (this.allAchievementsCache !== null) {
      return this.allAchievementsCache;
    }
    
    // If cache is not populated, return empty array
    // This should be rare since we usually pre-populate the cache
    console.warn('Achievement cache not populated, returning empty array. Call getAllAchievements() first.');
    return [];
  }
  
  /**
   * Get achievements by category
   */
  static async getAchievementsByCategory(category: AchievementCategory | string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', category)
        .order('rank', { ascending: false });
        
      if (error) throw error;
      
      return data as Achievement[] || [];
    } catch (error) {
      console.error(`Error fetching ${category} achievements:`, error);
      return [];
    }
  }
  
  /**
   * Get a single achievement by ID
   */
  static async getAchievementById(id: string): Promise<Achievement | null> {
    try {
      // Check cache first
      if (this.achievementCache.has(id)) {
        return this.achievementCache.get(id) || null;
      }
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        this.achievementCache.set(id, data as Achievement);
      }
      
      return data as Achievement || null;
    } catch (error) {
      console.error(`Error fetching achievement ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Get achievement by string ID (alias for getAchievementById for backwards compatibility)
   */
  static async getAchievementByStringId(id: string): Promise<Achievement | null> {
    return this.getAchievementById(id);
  }
  
  /**
   * Clear the achievement cache
   */
  static clearCache(): void {
    this.achievementCache.clear();
    this.allAchievementsCache = null;
  }
}
