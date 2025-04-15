
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENT_IDS } from '@/constants/achievements/AchievementConstants';

export class AchievementIdMappingService {
  private static idMap: Map<string, string> = new Map();
  
  static async initialize(): Promise<void> {
    try {
      // Fetch all achievements from database
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('id, name');
        
      if (error) throw error;
      
      // Create mapping from string IDs to UUIDs
      achievements?.forEach(achievement => {
        // Find matching achievement ID from constants
        for (const rank in ACHIEVEMENT_IDS) {
          for (const category in ACHIEVEMENT_IDS[rank]) {
            const stringIds = ACHIEVEMENT_IDS[rank][category];
            const matchingStringId = stringIds.find(id => 
              this.normalizeId(id) === this.normalizeId(achievement.name)
            );
            if (matchingStringId) {
              this.idMap.set(matchingStringId, achievement.id);
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize achievement ID mapping:', error);
    }
  }
  
  static getUuid(stringId: string): string | undefined {
    return this.idMap.get(stringId);
  }
  
  private static normalizeId(id: string): string {
    return id.toLowerCase().replace(/[-_\s]/g, '');
  }
}
