
import { supabase } from '@/integrations/supabase/client';

export class AchievementIdMappingService {
  /**
   * Legacy method for backward compatibility
   * Now simply queries the achievements table directly
   */
  static async getUuid(stringId: string): Promise<string | undefined> {
    const { data, error } = await supabase
      .from('achievements')
      .select('id')
      .eq('string_id', stringId)
      .single();
    
    if (error || !data) {
      console.warn(`No mapping found for achievement ID: ${stringId}`);
      return undefined;
    }
    
    return data.id;
  }

  /**
   * Deprecated: Kept for potential legacy code compatibility
   * Will be removed in future versions
   */
  static getAllMappings(): Map<string, string> {
    console.warn('getAllMappings() is deprecated and will be removed');
    return new Map();
  }

  /**
   * Stub method for potential future use or migration
   */
  static validateMappings(): { 
    unmapped: string[]; 
    missingDatabaseEntries: string[] 
  } {
    console.warn('validateMappings() is deprecated');
    return { unmapped: [], missingDatabaseEntries: [] };
  }
}
