
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { AchievementIdMappingService } from './AchievementIdMappingService';

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

      // Get all string IDs from constants
      const stringIds = Object.values(ACHIEVEMENTS)
        .flatMap(category => Object.values(category))
        .map(achievement => typeof achievement === 'string' ? achievement : achievement.id);

      // Get current ID mappings
      await AchievementIdMappingService.initialize();
      const mappings = AchievementIdMappingService.getAllMappings();

      // Validate string IDs against mappings
      for (const stringId of stringIds) {
        const uuid = mappings.get(stringId);
        if (uuid) {
          // Check if UUID exists in database
          const achievementExists = dbAchievements?.some(a => a.id === uuid);
          if (achievementExists) {
            result.valid.push(stringId);
          } else {
            result.invalid.push(stringId);
            result.suggestions.push({
              id: stringId,
              issue: 'UUID exists in mapping but not in database',
              suggestion: 'Create achievement record with ID: ' + uuid
            });
          }
        } else {
          result.invalid.push(stringId);
          result.suggestions.push({
            id: stringId,
            issue: 'Missing database entry',
            suggestion: 'Create database entry with ID: ' + stringId
          });
        }
      }

      // Find database achievements without string ID mappings
      const dbUuids = dbAchievements?.map(a => a.id) || [];
      const mappedUuids = Array.from(mappings.values());
      
      for (const dbUuid of dbUuids) {
        if (!mappedUuids.includes(dbUuid)) {
          result.missing.push(dbUuid);
          result.suggestions.push({
            id: dbUuid,
            issue: 'Missing constant definition',
            suggestion: 'Add constant definition for ID: ' + dbUuid
          });
        }
      }

      // Call database function to attempt automatic matching
      const { data: matches, error: matchError } = await supabase
        .rpc('match_achievement_by_name');

      if (matchError) throw matchError;

      // Add automatic matches to suggestions
      matches?.forEach((match: any) => {
        if (!result.suggestions.some(s => s.id === match.string_id)) {
          result.suggestions.push({
            id: match.string_id,
            issue: 'Automatic match found',
            suggestion: `Map to achievement "${match.name}" (${match.uuid})`
          });
        }
      });

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

      return count;
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
}
