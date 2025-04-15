
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENTS } from '@/constants/achievements';

interface AchievementIdMapping {
  stringId: string;
  uuid: string;
}

export class AchievementIdMappingService {
  private static mappings: Map<string, string> = new Map();

  static async initialize() {
    console.log('[AchievementIdMappingService] Initializing...');
    
    // Clear existing mappings
    this.mappings.clear();

    // Fetch existing mappings from database
    const { data, error } = await supabase
      .from('achievement_id_mappings')
      .select('*');

    if (error) {
      console.error('Failed to fetch achievement ID mappings:', error);
      throw error;
    }

    // Populate mappings
    data?.forEach(mapping => {
      this.mappings.set(mapping.string_id, mapping.uuid);
    });

    console.log(`[AchievementIdMappingService] Loaded ${this.mappings.size} mappings`);
  }

  static async clearAllMappings() {
    console.log('[AchievementIdMappingService] Clearing all mappings...');
    
    try {
      const { error } = await supabase
        .from('achievement_id_mappings')
        .delete()
        .neq('string_id', ''); // Delete all records
        
      if (error) throw error;
      
      // Clear local cache
      this.mappings.clear();
      
      console.log('[AchievementIdMappingService] All mappings cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear mappings:', error);
      throw error;
    }
  }

  private static async generateMissingMappings() {
    console.log('[AchievementIdMappingService] Generating missing mappings...');
    
    const allAchievements = Object.values(ACHIEVEMENTS)
      .flatMap(category => Object.values(category));

    const newMappings: Array<{string_id: string, uuid: string}> = [];
    
    for (const achievement of allAchievements) {
      const stringId = typeof achievement === 'string' 
        ? achievement 
        : (achievement as any).id;
      
      if (!stringId) {
        console.warn('Found achievement without string ID:', achievement);
        continue;
      }

      if (!this.mappings.has(stringId)) {
        const uuid = uuidv4();
        newMappings.push({ string_id: stringId, uuid });
        this.mappings.set(stringId, uuid);
      }
    }
    
    if (newMappings.length > 0) {
      try {
        const { error } = await supabase
          .from('achievement_id_mappings')
          .insert(newMappings)
          .select();
          
        if (error) throw error;
        
        console.log(`[AchievementIdMappingService] Created ${newMappings.length} new mappings`);
      } catch (error) {
        console.error('Failed to create new mappings:', error);
        throw error;
      }
    }
    
    return newMappings.length;
  }

  static getUuid(stringId: string): string | undefined {
    const uuid = this.mappings.get(stringId);
    if (!uuid) {
      console.warn(`[AchievementIdMappingService] No mapping found for achievement ID: ${stringId}`);
    }
    return uuid;
  }

  static getAllMappings(): Map<string, string> {
    return this.mappings;
  }

  static validateMappings(): { 
    unmapped: string[]; 
    missingDatabaseEntries: string[] 
  } {
    console.log('[AchievementIdMappingService] Validating mappings...');
    
    const allAchievements = Object.values(ACHIEVEMENTS)
      .flatMap(category => Object.values(category))
      .map(achievement => typeof achievement === 'string' 
        ? achievement 
        : (achievement as any).id
      )
      .filter(Boolean);

    const unmapped = allAchievements.filter(id => !this.mappings.has(id));
    const existingMappings = Array.from(this.mappings.keys());
    const missingDatabaseEntries = existingMappings.filter(id => 
      !allAchievements.includes(id)
    );

    console.log(`[AchievementIdMappingService] Found ${unmapped.length} unmapped achievements and ${missingDatabaseEntries.length} missing database entries`);
    
    return { unmapped, missingDatabaseEntries };
  }

  static async repairMappings() {
    console.log('[AchievementIdMappingService] Starting repair process...');
    
    // Clear all existing mappings first
    await this.clearAllMappings();
    
    // Reinitialize to ensure clean state
    await this.initialize();
    
    // Generate new mappings for all achievements
    const created = await this.generateMissingMappings();
    
    // Validate the results
    const validation = this.validateMappings();
    
    return {
      created,
      validation
    };
  }
}

// Initialize on import
AchievementIdMappingService.initialize().catch(console.error);
