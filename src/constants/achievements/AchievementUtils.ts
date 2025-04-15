
import { Achievement, AchievementCategory, AchievementRank, toAchievementCategory, toAchievementRank } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';
import { CachingService } from '@/services/common/CachingService';

export class AchievementUtils {
  private static readonly CACHE_KEY_ALL = 'achievements:all';
  private static readonly CACHE_KEY_PREFIX_BY_ID = 'achievements:id:';
  private static readonly CACHE_KEY_PREFIX_BY_CATEGORY = 'achievements:category:';
  private static readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  static async getAllAchievements(): Promise<Achievement[]> {
    try {
      const cached = CachingService.get<Achievement[]>(this.CACHE_KEY_ALL);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rank', { ascending: false });
        
      if (error) throw error;
      
      const achievements = data.map(achievement => this.mapDbAchievementToModel(achievement));
      
      CachingService.set(this.CACHE_KEY_ALL, achievements, this.CACHE_DURATION_MS);
      
      return achievements;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  static async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX_BY_CATEGORY}${category}`;
      const cached = CachingService.get<Achievement[]>(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', category)
        .order('rank', { ascending: false });
        
      if (error) throw error;
      
      const achievements = data.map(achievement => this.mapDbAchievementToModel(achievement));
      
      CachingService.set(cacheKey, achievements, this.CACHE_DURATION_MS);
      
      return achievements;
    } catch (error) {
      console.error(`Error fetching achievements for category ${category}:`, error);
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
      isUnlocked: false // Default value, will be updated when checking unlocked achievements
    };
  }

  static clearCache(): void {
    CachingService.clear(this.CACHE_KEY_ALL);
    CachingService.clearCategory(this.CACHE_KEY_PREFIX_BY_ID);
    CachingService.clearCategory(this.CACHE_KEY_PREFIX_BY_CATEGORY);
  }

  static async initialize(): Promise<void> {
    await this.getAllAchievements();
    console.log('Achievement system initialized');
  }
}
