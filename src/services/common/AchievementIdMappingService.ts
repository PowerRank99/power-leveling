
import { supabase } from '@/integrations/supabase/client';

/**
 * Service to handle mapping between string IDs and UUIDs for achievements
 */
export class AchievementIdMappingService {
  private static stringIdToUuidMap: Map<string, string> = new Map();
  private static uuidToStringIdMap: Map<string, string> = new Map();
  private static initialized = false;
  
  /**
   * Initialize the mapping service by loading all mappings
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Check if mapped ID table exists
      const { data: mappedIds, error: mappedError } = await supabase
        .from('achievement_id_mappings')
        .select('string_id, uuid');
      
      if (!mappedError && mappedIds) {
        // Add mappings to our maps
        mappedIds.forEach(mapping => {
          this.stringIdToUuidMap.set(mapping.string_id, mapping.uuid);
          this.uuidToStringIdMap.set(mapping.uuid, mapping.string_id);
        });
      }
      
      // If we need to dynamically generate mappings, we could add that here
      // For example, for any achievements that don't have mappings yet
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing achievement ID mapping service:', error);
    }
  }
  
  /**
   * Get UUID from string ID
   */
  static getUuid(stringId: string): string | undefined {
    return this.stringIdToUuidMap.get(stringId);
  }
  
  /**
   * Get string ID from UUID
   */
  static getStringId(uuid: string): string | undefined {
    return this.uuidToStringIdMap.get(uuid);
  }
  
  /**
   * Add a mapping
   */
  static addMapping(stringId: string, uuid: string): void {
    this.stringIdToUuidMap.set(stringId, uuid);
    this.uuidToStringIdMap.set(uuid, stringId);
  }
  
  /**
   * Check if a string ID is mapped
   */
  static isStringIdMapped(stringId: string): boolean {
    return this.stringIdToUuidMap.has(stringId);
  }
  
  /**
   * Check if a UUID is mapped
   */
  static isUuidMapped(uuid: string): boolean {
    return this.uuidToStringIdMap.has(uuid);
  }
  
  /**
   * Get all mappings
   */
  static getAllMappings(): { stringId: string; uuid: string }[] {
    const result: { stringId: string; uuid: string }[] = [];
    
    this.stringIdToUuidMap.forEach((uuid, stringId) => {
      result.push({ stringId, uuid });
    });
    
    return result;
  }
  
  /**
   * Reset mappings
   */
  static reset(): void {
    this.stringIdToUuidMap.clear();
    this.uuidToStringIdMap.clear();
    this.initialized = false;
  }
}
