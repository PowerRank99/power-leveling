
import { supabase } from '@/integrations/supabase/client';
import { CachingService } from '@/services/common/CachingService';

/**
 * Service for mapping between achievement string IDs and database UUIDs
 * Uses caching for performance optimization
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
   * Convert an array of UUIDs to string IDs
   */
  static async convertToStringIds(ids: string[]): Promise<string[]> {
    await this.ensureCache();
    const stringIds: string[] = [];
    
    for (const id of ids) {
      const stringId = await this.getStringIdById(id);
      if (stringId) stringIds.push(stringId);
    }
    
    return stringIds;
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
  
  /**
   * Fill in missing mappings by standardizing achievement names
   * This is a utility function for migration purposes
   */
  static async fillMissingMappings(): Promise<{ added: number; total: number }> {
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('id, name, string_id');
      
    if (error) {
      console.error('Error loading achievements for mapping:', error);
      return { added: 0, total: 0 };
    }
    
    let added = 0;
    const updates: { id: string; string_id: string }[] = [];
    
    // Process achievements without string_id
    for (const achievement of achievements) {
      if (!achievement.string_id && achievement.name) {
        // Generate standardized string ID from name
        const stringId = this.standardizeStringId(achievement.name);
        updates.push({
          id: achievement.id,
          string_id: stringId
        });
        added++;
      }
    }
    
    // Update database if needed
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('achievements')
          .update({ string_id: update.string_id })
          .eq('id', update.id);
          
        if (updateError) {
          console.error(`Error updating string_id for achievement ${update.id}:`, updateError);
        }
      }
      
      // Clear cache to ensure fresh data
      this.clearCache();
    }
    
    return { added, total: achievements.length };
  }
  
  /**
   * Standardize a string to be used as an achievement ID
   */
  static standardizeStringId(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
