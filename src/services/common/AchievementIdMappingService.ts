
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
    // Fetch existing mappings from database
    const { data, error } = await supabase
      .from('achievement_id_mappings')
      .select('*');

    if (error) {
      console.error('Failed to fetch achievement ID mappings:', error);
      return;
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
        this.mappings.set(stringId, uuid);
        
        // Insert mapping into database
        await supabase
          .from('achievement_id_mappings')
          .insert({ 
            string_id: stringId, 
            uuid 
          })
          .select();
      }
    }
  }

  static getUuid(stringId: string): string | undefined {
    return this.mappings.get(stringId);
  }

  static getAllMappings(): Map<string, string> {
    return this.mappings;
  }
}

// Automatically initialize on import
AchievementIdMappingService.initialize();

export default AchievementIdMappingService;
