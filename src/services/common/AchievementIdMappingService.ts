
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENT_IDS } from '@/constants/achievements/AchievementConstants';

export class AchievementIdMappingService {
  private static idMap: Map<string, string> = new Map();
  private static initialized: boolean = false;
  
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Fetch all achievements from database
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, name');
        
      if (error) {
        console.error('Failed to fetch achievements:', error);
        throw error;
      }
      
      if (!achievements) {
        console.error('No achievements found in database');
        return;
      }
      
      // Create mapping from string IDs to UUIDs
      achievements.forEach(achievement => {
        const normalizedName = this.normalizeId(achievement.name);
        
        // Find matching achievement ID from constants
        for (const rank in ACHIEVEMENT_IDS) {
          for (const category in ACHIEVEMENT_IDS[rank]) {
            const stringIds = ACHIEVEMENT_IDS[rank][category];
            const matchingStringId = stringIds.find(id => 
              this.normalizeId(id) === normalizedName
            );
            
            if (matchingStringId) {
              this.idMap.set(matchingStringId, achievement.id);
              console.log(`Mapped ${matchingStringId} to ${achievement.id}`);
            }
          }
        }
      });
      
      this.initialized = true;
      console.log(`Achievement ID mapping initialized with ${this.idMap.size} mappings`);
    } catch (error) {
      console.error('Failed to initialize achievement ID mapping:', error);
      throw error;
    }
  }
  
  static getUuid(stringId: string): string | undefined {
    const uuid = this.idMap.get(stringId);
    if (!uuid) {
      console.warn(`No UUID mapping found for achievement ID: ${stringId}`);
    }
    return uuid;
  }
  
  private static normalizeId(id: string): string {
    return id.toLowerCase()
      .replace(/[-_\s]/g, '') // Remove dashes, underscores, and spaces
      .replace(/[^a-z0-9]/g, ''); // Remove any non-alphanumeric characters
  }
}
