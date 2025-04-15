
import { supabase } from '@/integrations/supabase/client';

export class AchievementIdMappingService {
  private static initialized = false;
  private static mappingCache: Map<string, string> = new Map();

  /**
   * Initialize the mapping service - loads mappings from achievements table
   * @returns A promise that resolves when initialization is complete
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('id, string_id');
      
      if (error) throw error;
      
      if (data) {
        this.mappingCache.clear();
        data.forEach(achievement => {
          if (achievement.string_id && achievement.id) {
            this.mappingCache.set(achievement.string_id, achievement.id);
          }
        });
      }
      
      this.initialized = true;
      console.log(`Achievement ID mapping initialized with ${this.mappingCache.size} entries`);
    } catch (error) {
      console.error('Failed to initialize achievement ID mappings:', error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   * Now returns cached UUID from the database-sourced mapping
   */
  static getUuid(stringId: string): string | undefined {
    return this.mappingCache.get(stringId);
  }

  /**
   * Legacy method for backward compatibility
   * Now queries the achievements table directly
   */
  static async getUuidAsync(stringId: string): Promise<string | undefined> {
    // Check cache first for performance
    const cachedId = this.mappingCache.get(stringId);
    if (cachedId) return cachedId;
    
    // If not in cache, query the database
    const { data, error } = await supabase
      .from('achievements')
      .select('id')
      .eq('string_id', stringId)
      .single();
    
    if (error || !data) {
      console.warn(`No mapping found for achievement ID: ${stringId}`);
      return undefined;
    }
    
    // Update cache with the result
    this.mappingCache.set(stringId, data.id);
    return data.id;
  }

  /**
   * Deprecated: Kept for potential legacy code compatibility
   * Will be removed in future versions
   */
  static getAllMappings(): Map<string, string> {
    console.warn('getAllMappings() is deprecated and will be removed');
    return new Map(this.mappingCache);
  }

  /**
   * Validates the mappings by checking for unmapped achievements
   */
  static validateMappings(): { 
    unmapped: string[]; 
    missingDatabaseEntries: string[] 
  } {
    console.warn('validateMappings() is deprecated');
    return { unmapped: [], missingDatabaseEntries: [] };
  }
}
