import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENT_IDS } from '@/constants/achievements/AchievementConstants';

export class AchievementValidationService {
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
      const { data } = await supabase
        .from('achievements')
        .select('id')
        .eq('string_id', id)
        .single();
      
      if (data) {
        results.valid.push(id);
      } else {
        results.invalid.push(id);
      }
    }
    
    // Find achievements in DB that aren't in the constants
    this.databaseAchievements.forEach(dbStringId => {
      if (!stringIds.includes(dbStringId)) {
        results.missing.push(dbStringId);
      }
    });
    
    return results;
  }
  
  private static getAllStringIds(): string[] {
    const ids: string[] = [];
    Object.values(ACHIEVEMENT_IDS).forEach(rankAchievements => {
      Object.values(rankAchievements).forEach(categoryAchievements => {
        categoryAchievements.forEach(achievement => {
          if (typeof achievement === 'string') {
            ids.push(achievement);
          } else if (achievement && typeof achievement === 'object') {
            // Use a simple type assertion approach that avoids TypeScript errors
            const achievementObj = achievement as any;
            if (achievementObj && 'id' in achievementObj && typeof achievementObj.id === 'string') {
              ids.push(achievementObj.id);
            }
          }
        });
      });
    });
    return ids;
  }
  
  private static async loadDatabaseAchievements(): Promise<void> {
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('string_id');
      
    if (error) {
      console.error('Failed to load database achievements:', error);
      return;
    }
    
    this.databaseAchievements = new Set(
      achievements.map(a => a.string_id).filter(Boolean)
    );
  }
}
