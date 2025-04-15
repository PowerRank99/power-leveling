
import { supabase } from '@/integrations/supabase/client';
import { AchievementIdentifierService } from '@/services/rpg/achievements/AchievementIdentifierService';

/**
 * @deprecated Use AchievementIdentifierService instead
 */
export class AchievementIdMappingService {
  private static initialized = false;
  private static mappingCache: Map<string, string> = new Map();

  /**
   * @deprecated Use AchievementIdentifierService.getIdByStringId instead
   */
  static async initialize(): Promise<void> {
    console.warn('AchievementIdMappingService is deprecated. Use AchievementIdentifierService instead.');
    if (this.initialized) return;

    try {
      const result = await AchievementIdentifierService.convertToIds(Array.from(this.mappingCache.keys()));
      if (result.success) {
        this.initialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize achievement ID mappings:', error);
      throw error;
    }
  }

  /**
   * @deprecated Use AchievementIdentifierService.getIdByStringId instead
   */
  static getUuid(stringId: string): string | undefined {
    console.warn('getUuid is deprecated. Use AchievementIdentifierService.getIdByStringId instead.');
    return this.mappingCache.get(stringId);
  }

  /**
   * @deprecated Use AchievementIdentifierService.getIdByStringId instead
   */
  static async getUuidAsync(stringId: string): Promise<string | undefined> {
    console.warn('getUuidAsync is deprecated. Use AchievementIdentifierService.getIdByStringId instead.');
    const result = await AchievementIdentifierService.getIdByStringId(stringId);
    return result.success ? result.data : undefined;
  }

  /**
   * @deprecated Use AchievementIdentifierService directly
   */
  static getAllMappings(): Map<string, string> {
    console.warn('getAllMappings is deprecated. Use AchievementIdentifierService directly.');
    return new Map(this.mappingCache);
  }

  /**
   * @deprecated Validation is now handled by AchievementIdentifierService
   */
  static validateMappings(): { 
    unmapped: string[]; 
    missingDatabaseEntries: string[] 
  } {
    console.warn('validateMappings is deprecated. Use AchievementIdentifierService.validateRequiredAchievements instead.');
    return { unmapped: [], missingDatabaseEntries: [] };
  }
}
