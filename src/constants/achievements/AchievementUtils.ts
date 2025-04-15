
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
  
  /**
   * Get all achievements from the database
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank', { ascending: false });
        
      if (error) throw error;
      
      return data as Achievement[] || [];
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
    // This is a simplification - in a real app, you'd want to ensure the cache is populated first
    return Array.from(this.achievementCache.values());
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
  }
}
