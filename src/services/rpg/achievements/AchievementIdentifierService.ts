
import { supabase } from '@/integrations/supabase/client';
import { CachingService } from '@/services/common/CachingService';

/**
 * Service for mapping between achievement string IDs and database UUIDs
 * This service provides a consistent way to reference achievements across the app
 */
export class AchievementIdentifierService {
  private static readonly CACHE_KEY = 'achievement_identifiers';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  private static identifiersCache: Map<string, string> | null = null;
  
  /**
   * Get achievement database UUID by string ID
   */
  static async getIdByStringId(stringId: string): Promise<string | null> {
    await this.ensureCache();
    return this.identifiersCache?.get(stringId) || null;
  }
  
  /**
   * Get achievement string ID by database UUID
   */
  static async getStringIdById(id: string): Promise<string | null> {
    await this.ensureCache();
    for (const [stringId, uuid] of this.identifiersCache?.entries() || []) {
      if (uuid === id) return stringId;
    }
    return null;
  }
  
  /**
   * Convert an array of string IDs to database UUIDs
   */
  static async convertToIds(stringIds: string[]): Promise<string[]> {
    await this.ensureCache();
    const ids: string[] = [];
    
    for (const stringId of stringIds) {
      const id = this.identifiersCache?.get(stringId);
      if (id) ids.push(id);
    }
    
    return ids;
  }
  
  /**
   * Ensure the cache is loaded
   */
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
      achievements
        .filter(a => a.string_id)
        .map(a => [a.string_id, a.id])
    );
    
    CachingService.set(this.CACHE_KEY, this.identifiersCache, this.CACHE_DURATION);
  }
  
  /**
   * Clear the cache
   */
  static clearCache(): void {
    this.identifiersCache = null;
    CachingService.clear(this.CACHE_KEY);
  }
}
