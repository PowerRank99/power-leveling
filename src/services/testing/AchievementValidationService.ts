
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENT_IDS } from '@/constants/achievements/AchievementConstants';
import { AchievementIdMappingService } from '@/services/common/AchievementIdMappingService';

export class AchievementValidationService {
  private static validationResults: Map<string, boolean> = new Map();
  private static databaseAchievements: Set<string> = new Set();
  
  static async validateAll(): Promise<{
    valid: string[];
    invalid: string[];
    missing: string[];
  }> {
    await this.loadDatabaseAchievements();
    
    const stringIds = this.getAllStringIds();
    const results = {
      valid: [] as string[],
      invalid: [] as string[],
      missing: [] as string[]
    };
    
    for (const id of stringIds) {
      const uuid = AchievementIdMappingService.getUuid(id);
      if (uuid && this.databaseAchievements.has(uuid)) {
        results.valid.push(id);
      } else {
        results.invalid.push(id);
      }
    }
    
    // Find achievements in DB that aren't mapped
    const allMappings = AchievementIdMappingService.getAllMappings();
    this.databaseAchievements.forEach(dbId => {
      if (!Array.from(allMappings.values()).includes(dbId)) {
        results.missing.push(dbId);
      }
    });
    
    return results;
  }
  
  private static getAllStringIds(): string[] {
    const ids: string[] = [];
    Object.values(ACHIEVEMENT_IDS).forEach(rankAchievements => {
      Object.values(rankAchievements).forEach(categoryAchievements => {
        ids.push(...categoryAchievements);
      });
    });
    return ids;
  }
  
  private static async loadDatabaseAchievements(): Promise<void> {
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('id');
      
    if (error) {
      console.error('Failed to load database achievements:', error);
      return;
    }
    
    this.databaseAchievements = new Set(achievements.map(a => a.id));
  }
}
