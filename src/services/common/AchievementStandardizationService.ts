
import { supabase } from '@/integrations/supabase/client';
import { AchievementUtils } from '@/constants/achievements';

export class AchievementStandardizationService {
  static async validateAndStandardize() {
    const result = {
      valid: [] as string[],
      invalid: [] as string[],
      missing: [] as string[],
      suggestions: [] as Array<{
        id: string;
        issue: string;
        suggestion: string;
      }>
    };

    try {
      // Get all achievements from database
      const { data: dbAchievements, error } = await supabase
        .from('achievements')
        .select('*');

      if (error) throw error;

      // Check for achievements with missing string_id
      const missingStringIds = dbAchievements.filter(a => !a.string_id);
      
      for (const achievement of missingStringIds) {
        result.missing.push(achievement.id);
        result.suggestions.push({
          id: achievement.id,
          issue: 'Missing string_id',
          suggestion: `Generate string_id for "${achievement.name}"`
        });
      }
      
      // Check for achievements with proper string_ids
      const validStringIds = dbAchievements.filter(a => !!a.string_id);
      for (const achievement of validStringIds) {
        result.valid.push(achievement.string_id);
      }
      
      // Get automatic matches for missing string_ids
      if (missingStringIds.length > 0) {
        const { data: matches, error: matchError } = await supabase
          .rpc('match_achievement_by_name');

        if (matchError) throw matchError;

        // Add automatic matches to suggestions
        matches?.forEach((match: any) => {
          if (!result.suggestions.some(s => s.id === match.uuid)) {
            result.suggestions.push({
              id: match.uuid,
              issue: 'Automatic match found',
              suggestion: `Set string_id to "${match.string_id}" for achievement "${match.name}"`
            });
          }
        });
      }

      return result;
    } catch (error) {
      console.error('Validation failed:', error);
      throw error;
    }
  }

  static async migrateUnmappedAchievements() {
    try {
      const { data: count, error } = await supabase
        .rpc('complete_achievement_id_migration');

      if (error) throw error;
      
      // Clear the AchievementUtils cache
      AchievementUtils.clearCache();
      
      return count;
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
}
