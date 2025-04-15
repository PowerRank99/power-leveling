
import { supabase } from '@/integrations/supabase/client';

export class AchievementValidationService {
  private static databaseAchievements: Set<string> = new Set();
  
  static async validateAll(): Promise<{
    valid: string[];
    invalid: string[];
    missing: string[];
  }> {
    await this.loadDatabaseAchievements();
    
    const { data: expectedAchievements, error } = await supabase
      .from('achievements')
      .select('id, string_id');
      
    if (error) {
      console.error('Failed to load achievements:', error);
      return { valid: [], invalid: [], missing: [] };
    }
    
    const results = {
      valid: [] as string[],
      invalid: [] as string[],
      missing: [] as string[]
    };
    
    // Validate each achievement
    for (const achievement of expectedAchievements) {
      if (achievement.string_id) {
        results.valid.push(achievement.string_id);
      } else {
        results.invalid.push(achievement.id);
      }
    }
    
    // Find achievements in DB that aren't in the expected list
    this.databaseAchievements.forEach(dbStringId => {
      if (!results.valid.includes(dbStringId)) {
        results.missing.push(dbStringId);
      }
    });
    
    return results;
  }
  
  private static async loadDatabaseAchievements(): Promise<void> {
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('string_id')
      .not('string_id', 'is', null);
      
    if (error) {
      console.error('Failed to load database achievements:', error);
      return;
    }
    
    this.databaseAchievements = new Set(
      achievements.map(a => a.string_id).filter(Boolean)
    );
  }
}
