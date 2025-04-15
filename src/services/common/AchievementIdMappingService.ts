
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

    // Generate mappings for any missing achievements
    await this.generateMissingMappings();
  }

  private static async generateMissingMappings() {
    const allAchievements = Object.values(ACHIEVEMENTS)
      .flatMap(category => Object.values(category));

    for (const achievement of allAchievements) {
      const stringId = typeof achievement === 'string' 
        ? achievement 
        : (achievement as any).id;

      if (!this.mappings.has(stringId)) {
        const uuid = uuidv4();
        
        // Add to local map
        this.mappings.set(stringId, uuid);
        
        // Insert into database
        try {
          await supabase
            .from('achievement_id_mappings')
            .insert({ 
              string_id: stringId, 
              uuid 
            })
            .select();
            
          console.log(`Created new mapping for "${stringId}" -> "${uuid}"`);
        } catch (error) {
          console.error(`Failed to create mapping for "${stringId}":`, error);
        }
      }
    }
  }

  static getUuid(stringId: string): string | undefined {
    const uuid = this.mappings.get(stringId);
    if (!uuid) {
      console.warn(`No mapping found for achievement ID: ${stringId}`);
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

    return { unmapped, missingDatabaseEntries };
  }

  static async repairMappings() {
    await this.initialize();
    return this.validateMappings();
  }
}

// Automatically initialize on import
AchievementIdMappingService.initialize().catch(console.error);
