
/**
 * AchievementUtils
 * Primary interface for achievement operations using the database as source of truth
 */
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';
import { CachingService } from '@/services/common/CachingService';

export class AchievementUtils {
  // Cache keys
  private static readonly CACHE_KEY_ALL = 'achievements:all';
  private static readonly CACHE_KEY_PREFIX_BY_ID = 'achievements:id:';
  private static readonly CACHE_KEY_PREFIX_BY_CATEGORY = 'achievements:category:';
  private static readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Get all achievements from the database
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    try {
      // Check cache first
      const cached = CachingService.get<Achievement[]>(this.CACHE_KEY_ALL);
      if (cached) {
        return cached;
      }
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank', { ascending: false });
        
      if (error) throw error;
      
      const achievements = data.map(achievement => this.mapDbAchievementToModel(achievement));
      
      // Cache the results
      CachingService.set(this.CACHE_KEY_ALL, achievements, this.CACHE_DURATION_MS);
      
      return achievements;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }
  
  /**
   * Get achievements by category with proper typing
   */
  static async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    try {
      // Check cache first
      const cacheKey = `${this.CACHE_KEY_PREFIX_BY_CATEGORY}${category}`;
      const cached = CachingService.get<Achievement[]>(cacheKey);
      if (cached) {
        return cached;
      }
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', category)
        .order('rank', { ascending: false });
        
      if (error) throw error;
      
      const achievements = data.map(achievement => this.mapDbAchievementToModel(achievement));
      
      // Cache the results
      CachingService.set(cacheKey, achievements, this.CACHE_DURATION_MS);
      
      return achievements;
    } catch (error) {
      console.error(`Error fetching achievements for category ${category}:`, error);
      return [];
    }
  }
  
  /**
   * Get all achievements (synchronous version that returns cached data)
   * Used for performance-critical operations 
   */
  static getAllAchievementsSync(): Achievement[] {
    const cached = CachingService.get<Achievement[]>(this.CACHE_KEY_ALL);
    if (cached) {
      return cached;
    }
    console.warn('Achievement cache not populated. Call getAllAchievements() first.');
    return [];
  }
  
  /**
   * Get a single achievement by ID
   */
  static async getAchievementById(id: string): Promise<Achievement | null> {
    try {
      // Check cache first
      const cacheKey = `${this.CACHE_KEY_PREFIX_BY_ID}${id}`;
      const cached = CachingService.get<Achievement>(cacheKey);
      if (cached) {
        return cached;
      }
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const achievement = this.mapDbAchievementToModel(data);
        CachingService.set(cacheKey, achievement, this.CACHE_DURATION_MS);
        return achievement;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching achievement ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Get achievement by string ID (for backward compatibility)
   */
  static async getAchievementByStringId(stringId: string): Promise<Achievement | null> {
    try {
      // Try to get from all achievements cache first (most efficient)
      const allAchievements = CachingService.get<Achievement[]>(this.CACHE_KEY_ALL);
      if (allAchievements) {
        const achievement = allAchievements.find(a => a.stringId === stringId);
        if (achievement) return achievement;
      }
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('string_id', stringId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        const achievement = this.mapDbAchievementToModel(data);
        CachingService.set(
          `${this.CACHE_KEY_PREFIX_BY_ID}${achievement.id}`, 
          achievement, 
          this.CACHE_DURATION_MS
        );
        return achievement;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching achievement by string ID ${stringId}:`, error);
      return null;
    }
  }
  
  /**
   * Map database achievement record to Achievement model
   */
  private static mapDbAchievementToModel(dbAchievement: any): Achievement {
    return {
      id: dbAchievement.id,
      name: dbAchievement.name,
      description: dbAchievement.description,
      category: dbAchievement.category as AchievementCategory,
      rank: dbAchievement.rank as AchievementRank,
      points: dbAchievement.points,
      xpReward: dbAchievement.xp_reward,
      iconName: dbAchievement.icon_name,
      requirements: dbAchievement.requirements,
      stringId: dbAchievement.string_id
    };
  }
  
  /**
   * Clear the achievement cache
   */
  static clearCache(): void {
    CachingService.clear(this.CACHE_KEY_ALL);
    
    // In a real implementation, we would clear all category and ID caches too
    // This is a simplified version
  }
  
  /**
   * Initialize the achievement system
   * Preloads data into cache for better performance
   */
  static async initialize(): Promise<void> {
    await this.getAllAchievements();
    console.log('Achievement system initialized');
  }
}
