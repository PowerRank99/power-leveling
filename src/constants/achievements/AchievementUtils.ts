
/**
 * AchievementUtils
 * Primary interface for achievement operations using the database as source of truth
 */
import { Achievement, AchievementCategory, AchievementRank } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';

export class AchievementUtils {
  // Cache for achievements to improve performance
  private static achievementCache: Map<string, Achievement> = new Map();
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
      
      const achievements = data.map(achievement => this.mapDbAchievementToModel(achievement));
      
      // Cache the results
      this.allAchievementsCache = achievements;
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
   * Get all achievements by category
   */
  static async getAchievementsByCategory(category: AchievementCategory | string): Promise<Achievement[]> {
    try {
      // Try to use cache first for better performance
      if (this.allAchievementsCache !== null) {
        return this.allAchievementsCache.filter(achievement => 
          achievement.category === category
        );
      }
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', category)
        .order('rank', { ascending: false });
        
      if (error) throw error;
      
      const achievements = data.map(achievement => this.mapDbAchievementToModel(achievement));
      
      // Add to cache if not already cached
      achievements.forEach(achievement => {
        if (!this.achievementCache.has(achievement.id)) {
          this.achievementCache.set(achievement.id, achievement);
        }
      });
      
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
    if (this.allAchievementsCache !== null) {
      return this.allAchievementsCache;
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
        const achievement = this.mapDbAchievementToModel(data);
        this.achievementCache.set(id, achievement);
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
      // Check cache first
      const cachedAchievement = Array.from(this.achievementCache.values()).find(
        achievement => achievement.stringId === stringId
      );
      if (cachedAchievement) return cachedAchievement;
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('string_id', stringId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        const achievement = this.mapDbAchievementToModel(data);
        this.achievementCache.set(achievement.id, achievement);
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
    this.achievementCache.clear();
    this.allAchievementsCache = null;
  }
}
