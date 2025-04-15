import { Achievement, AchievementCategory, AchievementRank, toAchievementCategory, toAchievementRank } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';
import { CachingService } from '@/services/common/CachingService';

export class AchievementUtils {
  private static readonly CACHE_KEY_ALL = 'achievements:all';
  private static readonly CACHE_KEY_PREFIX_BY_ID = 'achievements:id:';
  private static readonly CACHE_KEY_PREFIX_BY_CATEGORY = 'achievements:category:';
  private static readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  
  // In-memory cache for synchronous operations
  private static achievementsCache: Achievement[] | null = null;
  private static categoryCache: Map<AchievementCategory, Achievement[]> = new Map();

  static async getAllAchievements(): Promise<Achievement[]> {
    try {
      // Check memory cache first
      if (this.achievementsCache) {
        return this.achievementsCache;
      }

      // Check persistent cache
      const cached = CachingService.get<Achievement[]>(this.CACHE_KEY_ALL);
      if (cached) {
        this.achievementsCache = cached;
        return cached;
      }

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank', { ascending: false });
        
      if (error) throw error;
      
      const achievements = data.map(achievement => this.mapDbAchievementToModel(achievement));
      
      // Update both caches
      CachingService.set(this.CACHE_KEY_ALL, achievements, this.CACHE_DURATION_MS);
      this.achievementsCache = achievements;
      
      return achievements;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  static async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    try {
      // Check category cache first
      const cachedCategory = this.categoryCache.get(category);
      if (cachedCategory) return cachedCategory;

      const cacheKey = `${this.CACHE_KEY_PREFIX_BY_CATEGORY}${category}`;
      const cached = CachingService.get<Achievement[]>(cacheKey);
      if (cached) {
        this.categoryCache.set(category, cached);
        return cached;
      }

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', category)
        .order('rank', { ascending: false });
        
      if (error) throw error;
      
      const achievements = data.map(achievement => this.mapDbAchievementToModel(achievement));
      
      // Update both caches
      CachingService.set(cacheKey, achievements, this.CACHE_DURATION_MS);
      this.categoryCache.set(category, achievements);
      
      return achievements;
    } catch (error) {
      console.error('Error fetching achievements by category:', error);
      return [];
    }
  }
  
  static async getAchievementById(id: string): Promise<Achievement | null> {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX_BY_ID}${id}`;
      const cached = CachingService.get<Achievement>(cacheKey);
      if (cached) return cached;
      
      // First try to find in the all achievements cache
      const allCached = CachingService.get<Achievement[]>(this.CACHE_KEY_ALL);
      if (allCached) {
        const found = allCached.find(a => a.id === id);
        if (found) {
          CachingService.set(cacheKey, found, this.CACHE_DURATION_MS);
          return found;
        }
      }

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) return null;
      
      const achievement = this.mapDbAchievementToModel(data);
      
      CachingService.set(cacheKey, achievement, this.CACHE_DURATION_MS);
      
      return achievement;
    } catch (error) {
      console.error(`Error fetching achievement by ID ${id}:`, error);
      return null;
    }
  }

  static clearCache(): void {
    CachingService.clear(this.CACHE_KEY_ALL);
    CachingService.clearCategory(this.CACHE_KEY_PREFIX_BY_ID);
    CachingService.clearCategory(this.CACHE_KEY_PREFIX_BY_CATEGORY);
    this.achievementsCache = null;
    this.categoryCache.clear();
  }

  static async initialize(): Promise<void> {
    await this.getAllAchievements();
    console.log('Achievement system initialized');
  }

  static async getAchievementHierarchy(): Promise<Record<AchievementRank, Record<AchievementCategory, Achievement[]>>> {
    const achievements = await this.getAllAchievements();
    const hierarchy: Record<AchievementRank, Record<AchievementCategory, Achievement[]>> = {} as any;
    
    achievements.forEach(achievement => {
      if (!hierarchy[achievement.rank]) {
        hierarchy[achievement.rank] = {} as Record<AchievementCategory, Achievement[]>;
      }
      if (!hierarchy[achievement.rank][achievement.category]) {
        hierarchy[achievement.rank][achievement.category] = [];
      }
      hierarchy[achievement.rank][achievement.category].push(achievement);
    });
    
    return hierarchy;
  }

  static async getNextAchievements(userId: string, category?: AchievementCategory): Promise<Achievement[]> {
    try {
      const { data: unlockedIds } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
      
      const allAchievements = await this.getAllAchievements();
      const unlockedSet = new Set(unlockedIds?.map(ua => ua.achievement_id));
      
      return allAchievements.filter(a => 
        !unlockedSet.has(a.id) && 
        (!category || a.category === category)
      );
    } catch (error) {
      console.error('Error fetching next achievements:', error);
      return [];
    }
  }

  private static mapDbAchievementToModel(dbAchievement: any): Achievement {
    return {
      id: dbAchievement.id,
      name: dbAchievement.name,
      description: dbAchievement.description,
      category: toAchievementCategory(dbAchievement.category),
      rank: toAchievementRank(dbAchievement.rank),
      points: dbAchievement.points,
      xpReward: dbAchievement.xp_reward,
      iconName: dbAchievement.icon_name,
      requirements: dbAchievement.requirements,
      stringId: dbAchievement.string_id,
      isUnlocked: false
    };
  }
}
