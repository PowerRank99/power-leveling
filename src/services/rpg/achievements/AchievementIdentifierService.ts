
import { supabase } from '@/integrations/supabase/client';
import { CachingService } from '@/services/common/CachingService';
import { Achievement } from '@/types/achievementTypes';

export class AchievementIdentifierService {
  private static readonly CACHE_KEY = 'achievement_identifiers';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  private static identifiersCache: Map<string, string> | null = null;
  
  static async getIdByStringId(stringId: string): Promise<string | null> {
    await this.ensureCache();
    return this.identifiersCache?.get(stringId) || null;
  }
  
  static async getStringIdById(id: string): Promise<string | null> {
    await this.ensureCache();
    for (const [stringId, uuid] of this.identifiersCache?.entries() || []) {
      if (uuid === id) return stringId;
    }
    return null;
  }
  
  private static async ensureCache(): Promise<void> {
    if (this.identifiersCache) return;
    
    const cached = CachingService.get<Map<string, string>>(this.CACHE_KEY);
    if (cached) {
      this.identifiersCache = cached;
      return;
    }
    
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('id, string_id');
      
    if (error) {
      console.error('Error loading achievement identifiers:', error);
      return;
    }
    
    this.identifiersCache = new Map(
      achievements.map(a => [a.string_id, a.id])
    );
    
    CachingService.set(this.CACHE_KEY, this.identifiersCache, this.CACHE_DURATION);
  }
  
  static clearCache(): void {
    this.identifiersCache = null;
    CachingService.clear(this.CACHE_KEY);
  }
}
