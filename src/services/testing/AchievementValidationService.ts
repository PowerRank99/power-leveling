
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
      .select('string_id')
      .order('string_id');
      
    if (error) {
      console.error('Failed to load achievements:', error);
      return { valid: [], invalid: [], missing: [] };
    }
    
    const stringIds = expectedAchievements.map(a => a.string_id);
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
    
    // Find achievements in DB that aren't in the expected list
    this.databaseAchievements.forEach(dbStringId => {
      if (!stringIds.includes(dbStringId)) {
        results.missing.push(dbStringId);
      }
    });
    
    return results;
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
