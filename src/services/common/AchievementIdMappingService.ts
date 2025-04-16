
import { supabase } from '@/integrations/supabase/client';

type AchievementIdMap = Record<string, string>;

export class AchievementIdMappingService {
  private static initialized = false;
  private static mappings: AchievementIdMap = {};
  
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Fetch all achievements from the database
      const { data, error } = await supabase
        .from('achievements')
        .select('id, string_id');
        
      if (error) {
        throw error;
      }
      
      // Build the mapping from string_id to UUID
      this.mappings = {};
      
      if (data) {
        data.forEach(achievement => {
          if (achievement.string_id && achievement.id) {
            this.mappings[achievement.string_id] = achievement.id;
          }
        });
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing achievement ID mappings:', error);
      throw error;
    }
  }
  
  static getMappings(): AchievementIdMap {
    return this.mappings;
  }
  
  static getAllMappings(): { stringId: string; uuid: string }[] {
    return Object.entries(this.mappings).map(([stringId, uuid]) => ({ stringId, uuid }));
  }
  
  static getDbId(stringId: string): string | undefined {
    return this.mappings[stringId];
  }
  
  static validateMappings() {
    const unmapped: string[] = [];
    const mappingIssues: { stringId: string; issue: string }[] = [];
    
    // Add validation logic here to check for unmapped achievements
    
    return {
      unmapped,
      mappingIssues,
      valid: unmapped.length === 0 && mappingIssues.length === 0
    };
  }
}
